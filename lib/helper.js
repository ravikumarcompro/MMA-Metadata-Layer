function validateConfig(config){
    if(config.url && config.apiKey){
        return true;
    }
    return false;
}

module.exports = { validateConfig }