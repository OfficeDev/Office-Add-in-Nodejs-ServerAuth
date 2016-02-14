/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

var express = require('express')
  , router = express.Router()
  , io = require('../app');
var dbHelper = new(require('../db/dbHelper'))();

function getLogoutUrl(req) {
    var providerLogoutEndpoint;
    var disconnectCompleteUrl = encodeURIComponent(req.protocol + '://' + req.get('host') + '/disconnect/' + req.params.providerName + '/complete/' + req.params.sessionID);
    switch (req.params.providerName) {
        case 'google':
            providerLogoutEndpoint = 'https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=';
            break;
        case 'azure':
            providerLogoutEndpoint = 'https://login.microsoftonline.com/common/oauth2/logout?post_logout_redirect_uri=';
            break;
    }
    return providerLogoutEndpoint + disconnectCompleteUrl;
}

router.get('/:providerName/complete/:sessionID', function (req, res) {
    io.to(req.params.sessionID).emit('disconnect_complete', req.params.providerName);
    res.render('disconnect_complete');
});

router.get('/:providerName/:sessionID', function (req, res) {
    dbHelper.deleteAccessToken (
        req.params.sessionID,
        req.params.providerName,
        function (error) {
            if (error === null) {
                res.redirect(getLogoutUrl(req));
            }
        }
    );
});

module.exports = router;
