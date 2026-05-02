require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ 
  extended: true,
  limit : '10kb'
}));

const {VoultClient} = require('voult-sdk');
const client = new VoultClient({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  baseURL: process.env.BASE_URL || 'http://localhost:3000'
});

const { signUpWithEmailAndPassword,signUpWithUsernameAndPassword } = require('voult-sdk');

app.post('/signup-email', async (req, res) => {
    console.log(req.body);
    const { email, password, fullName } = req.body;
    const { user, token } = await signUpWithEmailAndPassword(email, password, 
        { fullName }, 
        client
    );
    res.json({ user, token });
});

app.post('/signup-username', async (req, res) => {
    console.log(req.body);
    const { username, password, fullName, email} = req.body;
    const { user, token } = await signUpWithUsernameAndPassword(username, password,
        { fullName, email }, 
        client
    );
    res.json({ user, token });
});

const port = process.env.port || 2000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});