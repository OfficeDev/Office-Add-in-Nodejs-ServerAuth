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
      user.providers.splice(ii, 1);
      console.log("\n\nuser coming back: " + JSON.stringify(user));
      return user;
    }
  }
  console.log("\n\nskipped user: " + JSON.stringify(user));
  return user;
}

function getAppUrl(req) {
  return encodeURIComponent(req.protocol + '://' + req.get('host'));
}

router.get('/google/:sessionID', function (req, res) {
  dbHelper.getUser(req.params.sessionID, function (err, user) {
    // Get a temporary user object from the request
    // Remove the azure provider from the user object
    var updatedUser = disconnectService(user, 'google');
    
    // Remove the azure provider from the document
    dbHelper.insertDoc(updatedUser, null, function(err, body) {
      if(body.ok) {
        // Get the full URL of root to send it to the logout endpoint
        var appUrl = getAppUrl(req);
        var logoutUrl = 'https://www.google.com/accounts/Logout'
          + '?continue=https://appengine.google.com/_ah/logout?continue='
          + appUrl;
        res.redirect(logoutUrl);
      } else {
        console.log('Error updating document: ' + err);
      }
    });
  });
});

router.get('/azure/:sessionID', function (req, res) {
  dbHelper.getUser(req.params.sessionID, function (err, user) {
    // Get a temporary user object from the request
    // Remove the azure provider from the user object
    var updatedUser = disconnectService(user, 'azure');
    
    // Remove the azure provider from the document
    dbHelper.insertDoc(updatedUser, null, function(err, body) {
      if(body.ok) {
        // Get the full URL of root to send it to the logout endpoint
        var appUrl =  getAppUrl(req);
        var logoutUrl = 
        'https://login.microsoftonline.com/common/oauth2/logout' + 
        '?post_logout_redirect_uri=' + appUrl; 
        res.redirect(logoutUrl);
      } else {
        console.log('Error updating document: ' + err);
      }
    });
  });
});

module.exports = router;