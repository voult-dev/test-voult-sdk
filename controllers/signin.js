const client = require('../config/client');
const { signInWithEmailAndPassword,signInWithUsernameAndPassword, signInWithEmailLink } = require('voult-sdk');

module.exports.signinWithEmailAndPassword = async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    const { user, token } = await signInWithEmailAndPassword(email, password, client);
    res.json({ user, token });
};

module.exports.signinWithUsernameAndPassword = async (req, res) => {
    console.log(req.body);
    const { username, password } = req.body;
    const { user, token } = await signInWithUsernameAndPassword(username, password, client);
    res.json({
            "Message" : "Sign in successful",
            user, 
            token 
        });
};

module.exports.signInWithEmailLink = async(req, res) =>{
    console.log(req.body);
    const {email, redirectUri} = req.body;
    await signInWithEmailLink(
        email,
        {redirectUri},
        client
    );

    res.json({
        message : "Magic Link Sent Successfully to your email"
    });
}