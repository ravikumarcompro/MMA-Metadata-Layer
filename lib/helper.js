/*********************************Library References****************************************************************/ 

/*********************************Global Variables******************************************************************/  

/*********************************Functions************************************************************************/  

/**
 * returns true if config is correct and false if incorrect
 * @param { Object }  config  -  Config for Api endpoints.
 * @param { String }  config.apiKey  -  Key for API endpoint authentication.
 * @param { String }  config.url  -  MMA Endpoint base url.
 * @param { String }  config.id  -  Unique client id.
 * @returns { boolean } true/false depending upon config validation
 */
function validateConfig(config){
    // validate that Api base url and apiKey are present in config
    if(config.url && config.apiKey){
        return true;
    }
    return false;
}

module.exports = { validateConfig }