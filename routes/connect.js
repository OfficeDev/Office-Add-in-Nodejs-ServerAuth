var express = require('express')
  , router = express.Router()
  , passport = require('passport');

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
