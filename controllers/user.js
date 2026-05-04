const client = require('../config/client');
const {getCurrentUser, signOut} = require('voult-sdk');

module.exports.profile = async(req, res)=>{
    const profile = await getCurrentUser(client);
    res.json(profile);
}

module.exports.logout = async(req, res) =>{
    await signOut(client);
    res.json({
        message : "Signed out successfully"
    })
}