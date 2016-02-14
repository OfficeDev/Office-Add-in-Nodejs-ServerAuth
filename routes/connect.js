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
  var sessionID =
    cookieParser
      .signedCookie(jsonCookie.nodecookie, 'keyboard cat');
  console.log('Session ID: ' + sessionID);
  // the sessionID becomes the room name for this session
  socket.join(sessionID);
  io.to(sessionID).emit('init', 'Private socket session established');
});

router.get('/google/:sessionID', function(req, res, next) {
  passport.authenticate('google', 
    { 
      scope: 'profile', 
      accessType: 'offline', 
      state : req.params.sessionID 
    },
    function(err, authenticationData) {
        io.to(authenticationData.sessionID).emit('auth_success', authenticationData);
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
    function(err, authenticationData) {
        io.to(authenticationData.sessionID).emit('auth_success', authenticationData);
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
