/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

var express = require('express')
  , router = express.Router()
  , io = require('../app');
var dbHelper = new(require('../db/dbHelper'))();

var logoutEndpoints = {};
logoutEndpoints['google'] = 'https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=';
logoutEndpoints['azure'] = 'https://login.microsoftonline.com/common/oauth2/logout?post_logout_redirect_uri=';

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
                var disconnectCompleteUrl =
                    logoutEndpoints[req.params.providerName] + 
                    encodeURIComponent(req.protocol + '://' + req.get('host') + '/disconnect/' + req.params.providerName + '/complete/' + req.params.sessionID);
                res.redirect(disconnectCompleteUrl);
            }
        }
    );
});

module.exports = router;
