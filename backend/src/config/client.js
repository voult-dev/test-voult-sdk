import { VoultClient } from 'voult-sdk';

const baseURL = (process.env.VOULT_BASE_URL || process.env.base_url || 'https://api.voult.dev')
  .replace(/\/$/, '');

const client = new VoultClient({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  baseURL,
});

export default client;
