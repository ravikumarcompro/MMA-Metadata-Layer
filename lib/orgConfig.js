var Cloudant = require('cloudant');

module.exports = {
	"getCloudantInstance": getCloudantInstance,
    "getCloudantConfig": getCloudantConfig
}

function getCloudantInstance(orgID, config) {
    var cloudantConfig = getCloudantConfig(orgID, config);
    var cloudantInitObj = { account: cloudantConfig.username, password: cloudantConfig.password };

    if(config.cloudantRetryOptions && config.cloudantRetryOptions.retry) {
        cloudantInitObj.plugin = 'retry';
        cloudantInitObj.retryAttempts = config.cloudantRetryOptions.retryAttempts;
        cloudantInitObj.retryTimeout = config.cloudantRetryOptions.retryTimeout;
    }
    return Cloudant(cloudantInitObj);
}

function getCloudantConfig(orgID, config) {
    return config.organizations[orgID] ? config.organizations[orgID]['cloudant'] : config.organizations.default['cloudant'];
}

