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

io.on('connection', function (socket) {
  console.log('Socket connection est');
  var jsonCookie =
    cookie.parse(socket
      .handshake
      .headers
      .cookie);
  var decodedNodeCookie =
    cookieParser
      .signedCookie(jsonCookie.nodecookie, 'keyboard cat');
  console.log('de-signed cookie: ' + decodedNodeCookie);
  // the sessionID becomes the room name for this session
  socket.join(decodedNodeCookie);
  io.to(decodedNodeCookie).emit('init', 'Private socket session established');
});

router.get('/google/:sessionID', function(req, res, next) {
  passport.authenticate('google', 
    { 
      scope: 'profile', 
      accessType: 'offline', 
      state : req.params.sessionID 
    },
    function(err, userData) {
        // Leave only the provider that just got updated
        // so UI can easily update the view
        for(var i = 0; i < userData.providers.length; i++) {
            if (userData.providers[i].providerName !== 'google')  {
                userData.providers.splice(i, 1);
            }
        }
        // signal the client window (via socket) to
        // update the UI
        io.to(req.params.sessionID).emit('auth_success', userData);
        next();
    }
  )(req, res, next);
});

router.get('/google/callback', function(req, res, next) {
  res.render('auth_complete');
});

router.get('/azure/:sessionID', function(req, res, next) {
  passport.authenticate(
    'azure', 
    { state: req.params.sessionID },
    function (err, user) {
      var providers = [];
      for (var ii = 0; ii < user.providers.length; ii++) {
        var provider = user.providers[ii];
        providers.push({
          providerName: provider.providerName,
          displayName: provider.name,
          sessionID: user.sessid
        });
      }
      // signal the client window (via socket) to
      // update the user record in the db
      io.to(user.sessid).emit('auth_success', providers);
      next();
    }
  )(req, res, next);
});

router.get('/azure/callback', function(req, res, next) {
  res.render('auth_complete');
});

router.get('/error', function (req, res) {
  res.status(500);
  res.send('An unexpected error was encountered.');
});

module.exports = router;
