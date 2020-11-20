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
function getOrganizationInstance(orgId){
    if(organizationMap[orgId]){
        return organizationMap[orgId];
    } 
    else {
        return new Error("Organization External Metadata Module not found with id " + orgId); 
    }  
}

module.exports = { getOrganizationInstance };