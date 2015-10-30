var express = require('express')
  , router = express.Router()
  , passport = require('passport');

router.get('/azure', passport.authenticate('azure'));

router.get('/azure/callback',
  passport.authenticate('azure', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));

module.exports = router;
