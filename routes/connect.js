var express = require('express')
  , router = express.Router()
  , passport = require('passport')
  , io = require('../app');

io.on('connection', function (socket) {
  console.log('Socket connection est');
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
});

router.get('/error', function (req, res) {
  // TODO prompt them to report an issue on Github
  res.status(500);
  res.send('An unexpected error was encountered.');
});

module.exports = router;
