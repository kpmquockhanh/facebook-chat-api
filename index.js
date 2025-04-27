const fs = require("fs");
const login = require('./src/index.js');
const axios = require('axios');
const endpoint = 'http://192.168.0.3:1234/v1/chat/completions';
var log = require("npmlog");
async function getLLMResponse(prompt) {
  try {
    log.info('get llm response', prompt, endpoint);
    const response = await axios.post(endpoint, {
      messages: [{ role: 'user', content: prompt }]
    });

    console.log('OpenAI Response:', response.data.choices);
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

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
        if (!event.body || !event.body.startsWith("/ask ")) {
          break;
        }

        if (event.threadID != '2445307828897904' && event.threadID != '100005626272853') {
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
        });

        break;
      case "event":
        console.log(event);
        break;
    }
  });
});
