const { VoultClient } = require('voult-sdk');
const client = new VoultClient({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  baseURL:
    process.env.BASE_URL ||
    process.env.base_url ||
    'http://localhost:3000',
});

module.exports = client;