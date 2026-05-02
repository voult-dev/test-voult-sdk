const express = require('express');
const router = express.Router();

const controller = require('../controllers/signup');

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

module.exports = router;