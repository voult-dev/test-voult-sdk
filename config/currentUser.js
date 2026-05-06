const client = require('../config/client');
const {getCurrentUser} = require('voult-sdk');

module.exports = async ()=>{
    const result = await getCurrentUser(client);
    if(result){
        return result
    }
    return false
}