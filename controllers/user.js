const client = require('../config/client');
const {getCurrentUser, signOut, deleteUser} = require('voult-sdk');

module.exports.profile = async(req, res)=>{
    const profile = await getCurrentUser(client);
    res.json(profile);
}

module.exports.logout = async(req, res) =>{
    await signOut(client);
    res.json({
        message : "Signed out successfully"
    });
}

module.exports.deleteAcct = async(req, res)=>{
    await deleteUser(client);
    res.json({
        message : "User deleted successfully"
    });
}