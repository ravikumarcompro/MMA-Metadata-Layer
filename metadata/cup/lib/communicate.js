/*********************************Library References****************************************************************/ 
const request = require('request');

/*********************************Global Variables******************************************************************/  

/*********************************Functions************************************************************************/  


/**
 * returns latest taxonomy data corresponding to taxonomy's id.
 * @param { Object }  config  -  Config for Api endpoints.
 * @param { String }  config.apiKey  -  Key for API endpoint authentication.
 * @param { String }  config.url  -  MMA Endpoint base url.
 * @param { String }  config.id  -  Unique client id.
 * @param { String }  id - Taxonomy Id.
 * @returns { Promise } Promise which gets resolved with latest taxonomy data.
 */
function getLatestTaxonomyById(config, id){
    // generate url from base url for Latest Taxonomy
    let taxonomyUrl = config.url + '/taxonomies/' + id + '/latest';
    return get( taxonomyUrl, config.apiKey );
}


/**
 * returns Proxy data corresponding to term's proxy id.
 * @param { Object }  config  -  Config for Api endpoints.
 * @param { String }  config.apiKey  -  Key for API endpoint authentication.
 * @param { String }  config.url  -  MMA Endpoint base url.
 * @param { String }  config.id  -  Unique client id.
 * @param { String }  id - Proxy Id.
 * @returns { Promise } Promise which gets resolved with term's proxy data.
 */
function getProxyById(config, id){
    // generate url from base url for proxy
    let proxyUrl = config.url + '/proxies/' + id;
    return get( proxyUrl, config.apiKey);
}


/**
 * calls an external url with a authentication key.
 * @param {String} url - url to request.
 * @param {String} key - API key for authentication of endpoint.
 * @returns {Promise}  Promise which gets resolve with requested url response.
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