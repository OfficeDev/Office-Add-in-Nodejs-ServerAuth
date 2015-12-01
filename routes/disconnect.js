/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

var express = require('express')
  , router = express.Router()
  , passport = require('passport')
  , io = require('../app')
  , cookie = require("cookie")
  , cookieParser = require('cookie-parser')
  , dbHelper = new (require('../db-helper'))();

function disconnectService(user, serviceName) {
  // remove the supplied service from the provided user
  for (var ii = 0; ii < user.providers.length; ii++) {
    if (user.providers[ii].providerName === serviceName) {
      user.providers.splice(ii, 1);
      console.log("\n\nuser coming back: " + JSON.stringify(user));
      return user;
    }
  }
  console.log("\n\nskipped user: " + JSON.stringify(user));
  return user;
}

function getDisconnectCompleteUrl(req, service, sessionID) {
  return encodeURIComponent(req.protocol + '://' + req.get('host') + '/disconnect/' + service + '/complete/' + sessionID);
}

router.get('/google/complete/:sessionID', function (req, res, next) {
  var providers = [];
  providers.push({
      providerName: 'google'
  });
  io.to(req.params.sessionID).emit('disconnect_complete', providers);
  res.render('disconnect_complete');
});

router.get('/google/:sessionID', function (req, res) {
  dbHelper.getUser(req.params.sessionID, function (err, user) {
    // Get a temporary user object from the request
    // Remove the azure provider from the user object
    var updatedUser = disconnectService(user, 'google');
    
    // Remove the azure provider from the document
    dbHelper.insertDoc(updatedUser, null, function(err, body) {
      if(!err) {
        // Get the full URL of root to send it to the logout endpoint
        var appUrl = getDisconnectCompleteUrl(req, 'google', updatedUser.sessid);
          console.log('Disconnect URL: ' + appUrl);
        var logoutUrl = 'https://www.google.com/accounts/Logout'
          + '?continue=https://appengine.google.com/_ah/logout?continue='
          + appUrl;
        res.redirect(logoutUrl);
      } else if (err.message === 'Document update conflict.') {
        console.log('Retry one more time');
        dbHelper.getUser(req.params.sessionID, function (err, newUser) {
          dbHelper.insertDoc(disconnectService(newUser, 'google'), null, function(err, newUser){});
        });
      } else {
        console.log('Error updating document: ' + err.message);
      }
    });
  });
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
  dbHelper.getUser(req.params.sessionID, function (err, user) {
    // Get a temporary user object from the request
    // Remove the azure provider from the user object
    var updatedUser = disconnectService(user, 'azure');
    
    // Remove the azure provider from the document
    dbHelper.insertDoc(updatedUser, null, function(err, body) {
      if(!err) {
        // Get the full URL of root to send it to the logout endpoint
        var appUrl = getDisconnectCompleteUrl(req, 'azure', updatedUser.sessid);
        var logoutUrl = 
        'https://login.microsoftonline.com/common/oauth2/logout' + 
        '?post_logout_redirect_uri=' + appUrl; 
        res.redirect(logoutUrl);
      } else if (err.message === 'Document update conflict.') {
        console.log('Retry one more time');
        dbHelper.getUser(req.params.sessionID, function (err, newUser) {
          dbHelper.insertDoc(disconnectService(newUser, 'azure'), null, function(err, newUser){});
        });
      } else {
        console.log('Error updating document: ' + err);
      }
    });
  });
});

module.exports = router;