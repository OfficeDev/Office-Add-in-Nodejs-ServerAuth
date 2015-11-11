var express = require('express')
  , router = express.Router()
  , passport = require('passport')
  , io = require('../app')
  , cookie = require("cookie")
  , cookieParser = require('cookie-parser')
  , dbHelper = new (require('../db-helper'))()
  , passportRedirectConfig = {
    successRedirect: '/connect/close',
    failureRedirect: '/connect/error'
  };

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
  // the sessionId becomes the room name for this session
  socket.join(decodedNodeCookie);
  io.to(decodedNodeCookie).emit('init', 'Private socket session established');
});

router.get('/auth/google',
  passport.authenticate('google', { scope: 'profile', accessType: 'offline' }));

router.get('/auth/google/callback',
  passport.authenticate('google', passportRedirectConfig));

router.get('/azure', passport.authenticate('azure'));

router.get('/azure/callback',
  passport.authenticate('azure', passportRedirectConfig));

router.get('/close', function (req, res) {
  res.render('auth_complete');
  var user = req.user;

  var providers = [];
  for (var ii = 0; ii < user.providers.length; ii++) {
    var provider = user.providers[ii];
    providers.push({
      providerName: provider.providerName,
      displayName: provider.uniqueName || provider.name
    });
  }

  io.to(req.sessionID).emit('auth_success', providers);
});

router.get('/error', function (req, res) {
  // TODO prompt them to report an issue on Github
  res.status(500);
  res.send('An unexpected error was encountered.');
});

module.exports = router;
