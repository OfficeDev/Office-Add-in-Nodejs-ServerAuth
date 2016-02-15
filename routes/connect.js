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
var util = require('util');

var authenticationOptions = {};
authenticationOptions['google'] = { scope: 'profile', accessType: 'offline' };
authenticationOptions['azure'] = {};

io.on('connection', function (socket) {
  console.log('Socket connection est');
  var jsonCookie =
    cookie.parse(socket
      .handshake
      .headers
      .cookie);
  var sessionID =
    cookieParser
      .signedCookie(jsonCookie.nodecookie, 'keyboard cat');
  console.log('Session ID: ' + sessionID);
  // the sessionID becomes the room name for this session
  socket.join(sessionID);
  io.to(sessionID).emit('init', 'Private socket session established');
});

router.get('/:providerName/:sessionID', function(req, res, next) {
  authenticationOptions[req.params.providerName].state = req.params.sessionID;
  passport.authenticate(req.params.providerName, 
    authenticationOptions[req.params.providerName],
    function(err, authenticationData) {
        io.to(authenticationData.sessionID).emit('auth_success', authenticationData);
        next();
    }
  )(req, res, next);
});

router.get('/:providerName/callback', function(req, res) {
  res.render('auth_complete');
});

module.exports = router;
