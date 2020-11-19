/*********************************Library References****************************************************************/  
const { validateConfig } = require('./lib/helper');
const mma = require('./lib/mma');
const communicate = require('./lib/communicate');

/*********************************Global Variables******************************************************************/  
let externalMetadataConfig = null;


/*********************************Functions************************************************************************/  

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
        // Create a CategoryMap and return it
        let categoryMap = await mma.getCategoryMap(options, externalMetadataConfig);
        return Promise.resolve({ success:true, data:categoryMap });
    } catch(err){
        console.log(err);
        return Promise.reject({ success:false, err : err });
    }
}

/*The below function intializes this library with the config passed . The schema needed to configure this function is as follows
    {
        url:"xxxxxxxxxxxxxxxxxxx",  // base url of the mma endpoints
        id:"xxxxxxxx",              // unique id corresponding to the client
        apiKey:"XXXXXXXXXXXXX",     // apikey for the authentication of API endpoints
    }
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

/* Get a term proxy by Id 
Input:- id - Proxy id of a term
Output:- Proxy data of a term
*/
async function getProxyById(id){
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




module.exports = { getMetadata, configure, getProxyById }