/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

var express = require('express')
  , router = express.Router()
  , passport = require('passport')
  , io = require('../app')
  , cookie = require('cookie')
  , cookieParser = require('cookie-parser');
var dbHelper = new(require('../db/dbHelper'))();

function disconnectService(user, serviceName) {
  // Remove the supplied service from the provided user
  for (var ii = 0; ii < user.providers.length; ii++) {
    if (user.providers[ii].providerName === serviceName) {
      user.providers.splice(ii, 1);
      console.log('\n\nuser coming back: ' + JSON.stringify(user));
      return user;
    }
  }
  console.log('\n\nskipped user: ' + JSON.stringify(user));
  return user;
}

function getDisconnectCompleteUrl(req, service, sessionID) {
    return encodeURIComponent(req.protocol + '://' + req.get('host') + '/disconnect/' + service + '/complete/' + sessionID);
}

router.get('/google/complete/:sessionID', function (req, res) {
  io.to(req.params.sessionID).emit('disconnect_complete', 'google');
  res.render('disconnect_complete');
});

router.get('/google/:sessionID', function (req, res) {
    dbHelper.deleteAccessToken (
        req.params.sessionID,
        'google',
        function (error) {
            if (error === null) {
                var appUrl = getDisconnectCompleteUrl(req, 'google', req.params.sessionID);
                console.log('Disconnect URL: ' + appUrl);
                var logoutUrl = 'https://www.google.com/accounts/Logout'
                + '?continue=https://appengine.google.com/_ah/logout?continue='
                + appUrl;
                res.redirect(logoutUrl);
            }
        }
    );
});

router.get('/azure/complete/:sessionID', function (req, res, next) {
  var providers = [];
  providers.push({
      providerName: 'azure'
  });
  io.to(req.params.sessionID).emit('disconnect_complete', providers);
  res.render('disconnect_complete');
});

router.get('/azure/:sessionID', function (req, res) {
  req.session.azureAccessToken = null;
});

module.exports = router;
