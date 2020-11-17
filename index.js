const { validateConfig } = require('./lib/helper');
const mma = require('./lib/mma');
const communicate = require('./lib/communicate');

let externalMetadataConfig = null;

async function getMetadata(inputs){
    try {
        //if config is empty reject with Library not Initialized Error
        if(!externalMetadataConfig){
          return Promise.reject({ success: false , err: new Error("Library is not initialized ")})
        }
        //Check if taxonomy list is empty
        if(!input.taxonomies || inputs.taxonomies.length == 0 ){
            return Promise.reject({ success:false , err: "Taxonomy List is Empty" })
        }
        let categoryMap = await mma.getCategoryMap(inputs.taxonomies, externalMetadataConfig);
        return Promise.resolve({ success:true, data:categoryMap });
    } catch(err){
        console.log(err);
        return Promise.reject({ success:false, err : err });
    }
}

async function configure(config){
    if(validateConfig(config)){
        externalMetadataConfig = config;
        return Promise.resolve();
    }
    else{
        return Promise.reject(new Error('Configuration Error: Missing Values'));
    }
}

async function getProxyById(id){
    try {
        //if config is empty reject with Library not Initialized Error
        if(!externalMetadataConfig){
            return Promise.reject({ success: false , err: new Error("Library is not initialized ")})
        }

        if(!id){
            return Promise.reject(new Error ("Please provide a valid proxy id"));
        }
        
        let results = await communicate.getProxyById(externalMetadataConfig, id);
        return Promise.resolve(results);
    }
    catch(err){
        return Promise.reject(err);
    }
}



module.exports = { getMetadata, configure, getProxyById }