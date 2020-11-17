const request = require('request');


function getLatestTaxonomyById(config, id){
    let taxonomyUrl = config.url + '/taxonomies/' + id + '/latest';
    return get( taxonomyUrl, config.apiKey );
}

function getProxyById(config, id){
    let proxyUrl = cofig.url + '/proxies/' + id;
    return get( proxyUrl, config.apiKey);
}

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