var assert = require('assert');
var conf = require('../ws-conf');

describe('Config', function() {
    it('Checking sample configuration in ws-conf.js', function () {
        var azureConfigured = isProviderConfigured(conf.azureConf);
        var googleConfigured = isProviderConfigured(conf.googleConf);
        
        if(!azureConfigured) {
            console.log('Looks like Azure is not configured.');
        } else {
            console.log('Looks like Azure is configured.');
        }
        if(!googleConfigured) {
            console.log('Looks like Google is not configured.');
        } else {
            console.log('Looks like Google is configured.');
        }
        assert(
            azureConfigured || googleConfigured, 
        	'You need to configure at least one provider'
        );
    });
});

function isProviderConfigured(providerConf) {
    var clientIDConfigured = 
        typeof(providerConf.clientID) !== 'undefined' && 
        providerConf.clientID !== null &&
        providerConf.clientID !== '' &&
        providerConf.clientID !== 'ENTER_YOUR_CLIENT_ID';
    var clientSecretConfigured = 
        typeof(providerConf.clientSecret) !== 'undefined' && 
        providerConf.clientSecret !== null &&
        providerConf.clientSecret !== '' &&
        providerConf.clientSecret !== 'ENTER_YOUR_SECRET';
        
    return clientIDConfigured && clientSecretConfigured;
}
