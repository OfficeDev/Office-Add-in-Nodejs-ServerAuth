var express = require('express')
  , router = express.Router()
  , passport = require('passport')
  , io = require('../app')
  , cookie = require("cookie")
  , cookieParser = require('cookie-parser')
  , dbHelper = new (require('../db-helper'))();

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
  passport.authenticate('google', { scope: 'profile' }));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/connect/error' }),
  function (req, res) {
    // Successful authentication, redirect home.
    console.log('Google auth success');
    res.redirect('/');
  });

router.get('/azure', passport.authenticate('azure'));

router.get('/azure/callback',
  passport.authenticate('azure', {
    successRedirect: '/connect/close',
    failureRedirect: '/connect/error'
  }));

router.get('/close', function (req, res) {
  res.render('auth_complete');
  console.log("Successfully authenticated user:\n" + JSON.stringify(req.user));
  var serviceIndex;
  for (var ii = 0; ii < req.user.providers.length; ii++) {
    if ("azure" === req.user.providers[ii].providerName) {
      serviceIndex = ii;
      break;
    }
  }
  var provider = req.user.providers[ii];
  var ltdUser = {
    providers: [
      {
        providerName: "azure",
        // this is the name of the user, as known by the provider
        name: provider.name,
        // the email
        givenName: provider.uniqueName
      }
    ]
  }
  io.to(req.sessionID).emit('auth_success', ltdUser);
});

router.get('/error', function (req, res) {
  // TODO prompt them to report an issue on Github
  res.status(500);
  res.send('An unexpected error was encountered.');
});

module.exports = router;
