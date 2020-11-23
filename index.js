/*********************************Org References****************************************************************/  
const cup = require('./metadata/cup/index');

/*********************************Global Variables******************************************************************/  

const organizationMap = {
    'cup' : cup
}

/*********************************Functions************************************************************************/  
/**
 * return docs collection or categoryMap when resolved corresponding to clientId.
 * @param {Object} config configuration options for the external module.
 * @property config.id --> client id corresponding to the external module.
 * @property  config.source --> Urls and secrets needed by the external module.
 * @property  config.['builder-mapping'] --> Mapping information of external metadata to builder metadata.
 * @param {Boolean} docs whether to fetch docs or categoryMap. Fallback is categoryMap.
 * @returns {Promise} docs collection or categoryMap when resolved
 */
async function getExternalMetadata(config, docs){
    try{
        // get clientInstance
        let externalMetadataModule = await getClientInstance(config.id);
        // configure the external module
        await externalMetadataModule.configure(config.source); 
        // fetch parameters for external Metadata function.
        let parameters = fetchGetMetadataParameters(config, docs);
        if(!parameters){
            throw new Error('parameters for organization not found with id '+ config.id);
        }
        // call metadata function and return results.
        let results  = await externalMetadataModule.getMetadata(...parameters);
        return Promise.resolve(results);
    }
    catch(err){
        return Promise.reject(err);
    }

}

/**
 * returns instance of module corresponding to clientId.
 * @param {String} orgId  client id corresponding to the external module.
 * @returns {Object} instance of module corresponding to clientId.
 */
async function getClientInstance(clientId){
    if(organizationMap[clientId]){
        return Promise.resolve(organizationMap[clientId]);
    } 
    else {
        return Promise.reject("Organization External Metadata Module not found with id " + clientId); 
    }  
}

/**
 * return parameters needed to call getMetadata corresponfing to a specific clientId.
 * @param {Object} config configuration options for the external module.
 * @property config.id --> client id corresponding to the external module.
 * @property  config.source --> Urls and secrets needed by the external module.
 * @property  config.['builder-mapping'] --> Mapping information of external metadata to builder metadata.
 * @param {Boolean} docs whether to fetch docs or categoryMap. Fallback is categoryMap.
 * @returns {Object} parameters needed to call getMetadata 
 */
function fetchGetMetadataParameters(config, docs){
    switch (config.id){
        case 'cup' : 
            return [ { taxonomy: config['builder-mapping'].category.taxonomy, docs: docs || false } ];
        default:
            return null;
    }
}

/**
 * return tag details for a id.
 * @param {Object} config configuration options for the external module.
 * @property config.id --> client id corresponding to the external module.
 * @property  config.source --> Urls and secrets needed by the external module.
 * @property  config.['builder-mapping'] --> Mapping information of external metadata to builder metadata.
 * @param {String} id - tag id to fetch details for .
 * @returns {Object} tag details for a id.
 */
async function getTagDetails(config, id) {
    try {
         // get clientInstance
        let externalMetadataModule = await getClientInstance(config.id);
        // configure the external module
        await externalMetadataModule.configure(config.source);
        // call tag details function
        let result = await externalMetadataModule.getTagDetails(id);
        return Promise.resolve(result);
    }
    catch(err){
        return Promise.reject(err);
    }
}


module.exports = { getExternalMetadata, getTagDetails }
