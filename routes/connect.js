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

var authenticationOptions = {};
authenticationOptions['google'] = { session: false, scope: 'profile', accessType: 'offline' }
authenticationOptions['azure'] = { session: false };
var currentProvider;

io.on('connection', function (socket) {
  var jsonCookie =
    cookie.parse(socket
      .handshake
      .headers
      .cookie);
  var sessionID =
    cookieParser
      .signedCookie(jsonCookie.nodecookie, 'keyboard cat');
  // the sessionID becomes the room name for this session
  socket.join(sessionID);
});

router.get(
    '/google/:sessionID', 
    function(req, res, next) {
        authenticationOptions['google'].state = req.params.sessionID;
        next();
    },
    passport.authenticate('google', authenticationOptions['google'])
);

router.get(
    '/azure/:sessionID', 
    function(req, res, next) {
        authenticationOptions['azure'].state = req.params.sessionID;
        next();
    },
    passport.authenticate('azure', authenticationOptions['azure'])
);

router.get('/:providerName/callback', function(req, res) {
  io.to(req.user.sessionID).emit('auth_success', req.user);
  res.render('auth_complete');
});

module.exports = router;
