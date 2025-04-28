const fs = require("fs");
const login = require('./src/index.js');
require('dotenv').config();
const { ENABLE_IDS } = process.env;
var log = require("npmlog");
const { getLLMResponse } = require("./src/utils/llm.js");

login({ appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8')) }, (err, api) => {
  if (err) return console.error(err);
  api.setOptions({
    listenEvents: true,
    selfListen: true,
  });

  var stopListening = api.listenMqtt((err, event) => {
    if (err) return console.error(err);
    switch (event.type) {
      case "message":
        log.info('message', event)
        // Require to startsWith /ask
        if (!event.body || !event.body.startsWith("/ask ")) {
          break;
        }

        // Only reply by allowed ids
        if (!ENABLE_IDS.split(',').includes(event.threadID + '')) {
          break;
        }
        api.markAsRead(event.threadID, (err) => {
          if (err) console.error(err);
        });

        if (event.body === '/stop') {
          api.sendMessage("Goodbye…", event.threadID);
          return stopListening();
        }
        getLLMResponse(event.body.replace(/^.{5}/g, '')).then((response) => {
          if (!response) {
            response = 'Server error';
          }
          api.sendMessage("BOT: " + response, event.threadID);
        }).catch((e) => {
          log.error(`Error when request llm`, e)
        });

        break;
      case "event":
        console.log(event);
        break;
    }
  });
});
