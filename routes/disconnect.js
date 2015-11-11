var express = require('express')
  , router = express.Router()
  , passport = require('passport')
  , io = require('../app')
  , cookie = require("cookie")
  , cookieParser = require('cookie-parser')
  , dbHelper = new (require('../db-helper'))();

function disconnectService(user, serviceName) {
  // remove the supplied service from the provided user
  for (var ii = 0; ii < user.providers.length; ii++) {
    if (user.providers[ii].providerName === serviceName) {
      user.providers.splice[ii, 1];
      break;
    }
  }
}

function getAppUrl(req) {
  return encodeURIComponent(req.protocol + '://' + req.get('host'));
}

router.get('/google', function (req, res) {
  var updatedUser = req.user;
  disconnectService(updatedUser, 'google');
  dbHelper.insertDoc(updatedUser, null, function (err, body) {
    var appUrl = getAppUrl(req);
    var logoutUrl = '' + appUrl;
    res.redirect(logoutUrl);
  });
});

router.get('/azure', function (req, res) {
  // In some apps, you'd have to delete objects that you have stored
  // in the session object. This is not the case of this sample. 
  
  // Get a temporary user object from the request
  var updatedUser = req.user;
  
  // Remove the azure provider from the user object
  disconnectService(updatedUser, 'azure');
  
  // Remove the azure provider from the document
  dbHelper.insertDoc(updatedUser, null, function (err, body) {
    if (body.ok) {
      // Get the full URL of root to send it to the logout endpoint
      var appUrl = getAppUrl(req);
      var redirectUrl =
        'https://login.microsoftonline.com/common/oauth2/logout' +
        '?post_logout_redirect_uri=' + appUrl;
      res.redirect(redirectUrl);
    } else {
      console.log('Error updating document: ' + err);
    }
  });
});

module.exports = router;