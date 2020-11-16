const cup = require('./cup');

async function getCategoryMap(orgId, organizationConfig, baseConfig){
    try{
        let organization = getSpecificOrganization(organizationConfig.metadata.id);
        let results  = organization.getCategoryMap(orgId, organizationConfig, baseConfig);
        if(!results)
            return Promise.reject(new Error('Organization Specific Logic Not Found in the Builder Interface'));
        return Promise.resolve(results);
    }
    catch(err){
        console.log(err);
        return Promise.reject(err);
    }

}

function getSpecificOrganization(id){
    switch (id){
        case 'cup' : 
            return cup;
        default:
            return null;
    }
}




module.exports = { getCategoryMap }