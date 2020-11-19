/*********************************Library References****************************************************************/ 
const request = require('request');

/*********************************Global Variables******************************************************************/  

/*********************************Functions************************************************************************/  

/*return Latest Taxonomy Data From a Taxonomy id 
Input: 1. id - taxonomy_id
       2. config - {
                url:"xxxxxxxxxxxxxxxxxxx",  // base url of the mma endpoints
                id:"xxxxxxxx",              // unique id corresponding to the client
                apiKey:"XXXXXXXXXXXXX",     // apikey for the authentication of API endpoints
            }
Output: Latest Taxonomy Data
*/
function getLatestTaxonomyById(config, id){
    // generate url from base url for Latest Taxonomy
    let taxonomyUrl = config.url + '/taxonomies/' + id + '/latest';
    return get( taxonomyUrl, config.apiKey );
}

/*return  Proxy Data From a Proxy id 
Input: 1. id - proxy_id
       2. config - {
                url:"xxxxxxxxxxxxxxxxxxx",  // base url of the mma endpoints
                id:"xxxxxxxx",              // unique id corresponding to the client
                apiKey:"XXXXXXXXXXXXX",     // apikey for the authentication of API endpoints
            }
Output: Proxy Data for a Term
*/
function getProxyById(config, id){
    // generate url from base url for proxy
    let proxyUrl = cofig.url + '/proxies/' + id;
    return get( proxyUrl, config.apiKey);
}

/* simulates a Http/Https get request 
Input: 1. url - url to request
       2. key - apikey for the authentication of API endpoints
Output: Get request Data 
*/
async function get(url, key){
    return new Promise((resolve,reject)=>{
        try {
            let options = {
                url : url,
                method : 'get',
                headers:{
                    'x-api-key': key
                }
            }
            request(options, function(err, res, body){
                if(err){
                return resolve({});
                }
                return resolve(JSON.parse(body));
            });
        }
        catch(err){
            return reject(err);
        }
    })
}

module.exports = { getLatestTaxonomyById, getProxyById }