require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.port || 2000;
import { VoultClient } from 'voult-sdk';
import { signUpWithEmailAndPassword } from 'voult-sdk';

const client = new VoultClient({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  baseURL: process.env.BASE_URL
});

app.post('/signup-email', async (req, res) => {
    const { email, password } = req.body;
    const { user, token } = await signUpWithEmailAndPassword(email, password, client);
    res.json({ user, token });
});

app.get('/', (req, res) => {
    res.send('Hello World');
});




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
