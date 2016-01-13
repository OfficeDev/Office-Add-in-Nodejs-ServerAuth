/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

var express = require('express')
  , router = express.Router()
  , dbHelper = new (require('../db-helper'))();

/* GET home page. */
router.get('/', function (req, res, next) {
  var user = req.user;
  var userState = {
    title: 'Express',
    sessionID : req.sessionID,
    azure: false,
    google: false
  };
  if (user) {
    console.log('session found');
    assessUserState(userState, user);
    console.log(JSON.stringify(user));
    res.render('index', userState);
    console.log('Requestor: [' + userState.sessionID + ']');
  } else {
    console.log('no sessionfound');
    dbHelper.getUser(userState.sessionID, function (err, user) {
      req.user = user;
      assessUserState(userState, user);
      res.render('index', userState);
      console.log('Requestor: [' + userState.sessionID + ']');
    });
  }
});

function assessUserState(state, user) {
  if (user) {
    var azure = getServiceByName(user, 'azure');
    var google = getServiceByName(user, 'google');
    if (azure) {
      state.azureName = azure.name;
      state.azure = true;
    }
    if (google) {
      state.google = true;
      state.googleName = google.name;
    }
  }
}

function getServiceByName(user, serviceName) {
  var service;
  if (user.providers) {
    user.providers.forEach(function (provider) {
      if (serviceName === provider.providerName) {
        console.log('Found service: ' + serviceName);
        service = provider;
      }
    });
  }
  return service;
}

module.exports = router;
