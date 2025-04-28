var log = require("npmlog");
const axios = require('axios');

const { LLM_ENTPOINT } = process.env;

const getLLMResponse = async function(prompt) {
  const endpoint = LLM_ENTPOINT;
  log.info("LLM_ENTPOINT", LLM_ENTPOINT);

  try {
    const response = await axios.post(endpoint, {
      messages: [{ role: 'user', content: prompt }]
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    log.error('Error:', error.response ? error.response.data : error.message);
  }
}

module.exports = { getLLMResponse };
