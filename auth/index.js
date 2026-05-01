import { VoultClient } from 'voult-sdk';

const client = new VoultClient({
clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  baseURL: process.env.BASE_URL
});

export default client;