/*********************************Library References****************************************************************/ 

/*********************************Global Variables******************************************************************/  

/*********************************Functions************************************************************************/  

/*
Output:- True/False depending upon validation
Input:- config -->{
                        "url":"mma_base_url",
                        "id":"unique_id_mma_client"
                        "apiKey":"authentication_key_for_MMA_Api"
                } 
*/
function validateConfig(config){
    // validate that Api base url and apiKey are present in config
    if(config.url && config.apiKey){
        return true;
    }
    return false;
}

module.exports = { validateConfig }