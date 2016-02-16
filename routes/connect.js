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

io.on('connection', function (socket) {
  var jsonCookie = cookie.parse(socket.handshake.headers.cookie);
  var sessionID = cookieParser.signedCookie(jsonCookie.nodecookie, 'keyboard cat');
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
    dbHelper.saveAccessToken(
        req.user.sessionID,
        req.params.providerName,
        req.user.displayName,
        req.user.accessToken,
        function doneSaving (error) {
            // Intentionally strip the access token off the user object before
            // sending it to the client.
            // Client doesn't need it unless you want to make API calls client-side
            req.user.accessToken = null;
            io.to(req.user.sessionID).emit('auth_success', req.user);
            res.render('auth_complete');
        }
    )
});

module.exports = router;
