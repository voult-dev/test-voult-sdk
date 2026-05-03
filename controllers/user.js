const client = require('../config/client');
const {getCurrentUser} = require('voult-sdk');

module.exports.profile = async(req, res)=>{
    const profile = await getCurrentUser(client);
    res.json(profile);
}