var express = require('express')
  , router = express.Router()
  , passport = require('passport')
  , io = require('../app')
  , cookie = require("cookie")
  , cookieParser = require('cookie-parser');

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

router.get('/azure', passport.authenticate('azure'));

router.get('/azure/callback',
  passport.authenticate('azure', {
    successRedirect: '/connect/close',
    failureRedirect: '/connect/error'
  }));

router.get('/close', function (req, res) {
  res.render('auth_complete');
  console.log("Successfully authenticated user:\n" + JSON.stringify(req.user));
  // transmit this data back over the socket?
  console.log("session id: " + req.sessionID);
  io.to(req.sessionID).emit('auth_success', {
    provider: 'azure',
    event: 'authentication complete!'
  });
});

router.get('/error', function (req, res) {
  // TODO prompt them to report an issue on Github
  res.status(500);
  res.send('An unexpected error was encountered.');
});

module.exports = router;
