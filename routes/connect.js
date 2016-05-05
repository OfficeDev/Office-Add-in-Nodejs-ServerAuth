/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

var express = require('express');
var router = express.Router();
var passport = require('passport');
var io = require('../app');
var cookie = require('cookie');
var csrf = require('csurf');
var cookieParser = require('cookie-parser');
var dbHelper = new(require('../db/dbHelper'))();
var authenticationOptions = {};

authenticationOptions.google = { session: false, scope: 'profile', accessType: 'offline' };
authenticationOptions.azure = { session: false };

io.on('connection', function onConnection(socket) {
  var jsonCookie = cookie.parse(socket.handshake.headers.cookie);
  var sessionID = cookieParser.signedCookie(jsonCookie.nodecookie, 'keyboard cat');
  socket.join(sessionID);
});

router.use(csrf());

router.get(
  '/google/:sessionID',
  function handleRequest(req, res, next) {
    authenticationOptions.google.state = req.params.sessionID;
    next();
  },
  passport.authenticate('google', authenticationOptions.google)
);

router.get(
  '/azure/:sessionID',
  function handleRequest(req, res, next) {
    // Include the sessionID and csrftToken value in the OAuth state parameter
    authenticationOptions.azure.state = req.params.sessionID + '|' + req.csrfToken();
    res.cookie('CSRF-TOKEN', req.csrfToken());
    next();
  },
  passport.authenticate('azure', authenticationOptions.azure)
);

router.get('/:providerName/callback', function handleRequest(req, res) {
  // At the end of the OAuth flow we need to verify that csrfToken in the cookies
  // matches the one returned by the OAuth flow
  if (req.cookies['CSRF-TOKEN'] !== req.user.csrfToken) {
    res.render('error', {
      error: {
        status: 403
      },
      message: 'Bad or missing CSRF value'
    });
    return;
  }

  dbHelper.saveAccessToken(
    req.user.sessionID,
    req.params.providerName,
    req.user.displayName,
    req.user.accessToken,
    function callback(error) {
      if (error) {
        throw error;
      } else {
        // Intentionally strip the access token off the user object before
        // sending it to the client.
        // Client doesn't need it unless you want to make API calls client-side
        req.user.accessToken = null;
        io.to(req.user.sessionID).emit('auth_success', req.user);
        res.render('auth_complete');
      }
    }
  );
});

module.exports = router;
