const cloudantOrgConfig = require('./lib/orgConfig');
const moduleSelection = require('./organization/moduleSelection');
const util = require('util');
const cup = require('./organization/cup');
let baseConfig = null;

async function getMetadata(orgId){
    try {
        if(!baseConfig)
          return Promise.reject({ success: false , err: new Error("Library is not initialized ") });
        let cloudantInstance = cloudantOrgConfig.getCloudantInstance(orgId, baseConfig);
        let metaDb = cloudantInstance.db.use('organizations');
        let getConfigMethod = util.promisify(metaDb.get);
        let organizationConfig = await getConfigMethod(orgId);
        let categoryMap = await cup.getCategoryMap(orgId, organizationConfig, baseConfig);
        return Promise.resolve({ success:true, data:categoryMap });
    } catch(err){
        console.log(err);
        return Promise.reject({ success:false, err : err });
    }
}

function configure(config){
    baseConfig = config;
}


module.exports = { getMetadata, configure }