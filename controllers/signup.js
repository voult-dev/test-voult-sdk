const client = require('../config/client');
const { signUpWithEmailAndPassword,signUpWithUsernameAndPassword } = require('voult-sdk');

module.exports.signupWithEmailAndPassword = async (req, res) => {
    console.log(req.body);
    const { email, password, fullName } = req.body;
    const { user, token } = await signUpWithEmailAndPassword(email, password, 
        { fullName }, 
        client
    );
    res.json({ user, token });
};

module.exports.signupWithUsernameAndPassword = async (req, res) => {
    console.log(req.body);
    const { username, password, fullName, email} = req.body;
    const { user, token } = await signUpWithUsernameAndPassword(username, password,
        { fullName, email }, 
        client
    );
    res.json({ user, token });
};