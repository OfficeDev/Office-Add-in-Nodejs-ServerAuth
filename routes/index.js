var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
  console.log("Requestor: [" + req.sessionID + "]");
  console.log("Cookies: " + req.cookies);
});

module.exports = router;
