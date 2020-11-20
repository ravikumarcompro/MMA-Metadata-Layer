/*********************************Org References****************************************************************/  
const cup = require('./organizations/cup/index');

/*********************************Global Variables******************************************************************/  

const organizationMap = {
    'cup' : cup
}

/*********************************Functions************************************************************************/  
/**
 * return a instance of organization corresponding to orgId passed.
 * @param {String} orgId Organization unique Id.
 * @returns {Object} Organization Instance
 */
async function getOrganizationInstance(orgId){
    if(organizationMap[orgId]){
        return Promise.resolve(organizationMap[orgId]);
    } 
    else {
        return Promise.reject("Organization External Metadata Module not found with id " + orgId); 
    }  
}

module.exports = { getOrganizationInstance };