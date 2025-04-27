const fs = require("fs");
const login = require('./src/index.js');
const axios = require('axios');
const endpoint = 'http://192.168.0.3:1234/v1/chat/completions';
var log = require("npmlog");
const generateHistory = (histories) => {
  return histories.map(h => {
    return {
      role: h.body.startsWith('BOT: ') ? 'assistant' : 'user',
      content: h.body,
    }
  })
}

login({ appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8')) }, (err, api) => {
  if (err) return console.error(err);

  api.setOptions({
    listenEvents: true,
    selfListen: true,
  });
  api.getThreadHistory('100005626272853', 20, undefined, async (err, his) => {
    const gHist = generateHistory(his)
    const response = await axios.post(endpoint, {
      messages: [...gHist, { role: 'user', content: 'xin chao' }]
    });
    log.info('gHist', [...gHist, { role: 'user', content: 'xin chao' }], response.data.choices[0].message.content);
  });

  //api.sendMessage("Goodbye…", '100005626272853');
});
