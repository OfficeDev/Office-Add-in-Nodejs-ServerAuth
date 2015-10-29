var express = require('express')
  , router = express.Router()
  , passport = require('passport');

router.get('/azure', passport.authenticate('azure'));

router.get('/:service/callback', function (req, res) {
  var service = req.params.service;
  var code = req.query.code;
  res.render('auth_complete');
});

module.exports = router;
