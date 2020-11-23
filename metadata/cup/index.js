/*********************************Library References****************************************************************/  
const { validateConfig } = require('./lib/helper');
const communicate = require('./lib/communicate');
const categoryMap = require('./lib/category-map');
const docsMethod = require('./lib/docs-method');

/*********************************Global Variables******************************************************************/  
let externalMetadataConfig = null;


/*********************************Functions************************************************************************/  

/**
 * returns  categoryMap/docs fetched from MMA endpoints .
 * @param { Object }  options - Options.
 * @param { Object }  options.taxonomy - Pass taxonomy list .
 * @param { boolean } options.docs - Set true to fetch all docs and false to fetch categoryMap.
 * @returns { Promise } Promise which gives category map / docs when resolved.
 * 
 */
async function getMetadata(options){
    try {
        //if config is empty reject with Library not Initialized Error
        if(!externalMetadataConfig){
          return Promise.reject({ success: false , err: new Error("Library is not initialized ")})
        }
        //Check if Taxonomy list is empty
        if(!options || !options.taxonomy || options.taxonomy.length == 0 ){
            return Promise.reject({ success:false , err: "Taxonomy List is Empty or Not Present" })
        }
        let response ;
        // if docs flag is true fetch all docs and convert into builder format and return 
        if(options.docs && options.docs == true){
            response = await docsMethod.getAllDocs(options, externalMetadataConfig);
        }
        else{ // else make a categoryMap from metadata and return it
            response = await categoryMap.getCategoryMap(options, externalMetadataConfig);
        }
        return Promise.resolve({ success:true, data:response });
    } catch(err){
        return Promise.reject({ success:false, err : err });
    }
}


/** This method configures this library with passed config(apiKey, url, id).
 * @param { Object }  config  -  Config for Api endpoints.
 * @param { String }  config.apiKey  -  Key for API endpoint authentication.
 * @param { String }  config.url  -  MMA Endpoint base url.
 * @param { String }  config.id  -  Unique client id.
 * @returns {Promise} A promise which gets resolved on library initialization and if passed config is valid.
 */
async function configure(config){
    // validateConfig Method validates that the config passed have all the values required to intialize this library.
    if(validateConfig(config)){
        externalMetadataConfig = config;
        return Promise.resolve();
    }
    else{
        return Promise.reject(new Error('Configuration Error: Missing Values'));
    }
}

/**
 * returns Proxy data for a term's proxy id.
 * @param {String} id - Proxy Id of a term.
 * @returns {Promise} Promise which gets resolved with term's proxy data.
 */
async function getTagDetails(id){
    try {
        //if config is empty reject with Library not Initialized Error
        if(!externalMetadataConfig){
            return Promise.reject({ success: false , err: new Error("Library is not initialized ")})
        }
        // If empty proxyId is passed reject with a error.
        if(!id){
            return Promise.reject(new Error ("Please provide a valid proxy id"));
        }
        // Fetch a Term Proxy by its id and return it.
        let results = await communicate.getProxyById(externalMetadataConfig, id);
        return Promise.resolve(results);
    }
    catch(err){
        return Promise.reject(err);
    }
}




module.exports = { getMetadata, configure, getTagDetails }