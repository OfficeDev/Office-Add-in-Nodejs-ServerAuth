var express = require('express')
  , router = express.Router()
  , passport = require('passport')
  , io = require('../app')
  , cookie = require("cookie")
  , cookieParser = require('cookie-parser');

io.on('connection', function (socket) {
  console.log('Socket connection est');
  console.log(socket.handshake.headers.cookie);
  var jsonCookie =
    cookie.parse(socket.handshake.headers.cookie);
  var nodecookie = jsonCookie.nodecookie;
  var decodedCookie = cookieParser.signedCookie(nodecookie, "keyboard cat");
  console.log("nodecookie: " + nodecookie);
  console.log("de-signed cookie: " + decodedCookie);
  /*
 Tie this data back to socket session...maybe make a 'room'?
 http://stackoverflow.com/questions/6913801/sending-message-to-specific-client-with-socket-io-and-empty-message-queue
 */
  socket.emit('init', "connection est")
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
});

router.get('/error', function (req, res) {
  // TODO prompt them to report an issue on Github
  res.status(500);
  res.send('An unexpected error was encountered.');
});

module.exports = router;
