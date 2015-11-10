var express = require('express')
  , router = express.Router()
  , passport = require('passport')
  , io = require('../app')
  , cookie = require("cookie")
  , cookieParser = require('cookie-parser')
  , dbHelper = new (require('../db-helper'))();

router.get('/azure', function(req, res) {
  // In some apps, you'd have to delete objects that you have stored
  // in the session object. This is not the case of this sample. 
  
  // Get a temporary user object from the request
  var updatedUser = req.user;
  
  // Remove the azure provider from the user object
  for(var i = 0; i < updatedUser.providers.length; i++) {
    if(updatedUser.providers[i].providerName === 'azure') {
      updatedUser.providers.splice(i, 1);
      break;
    }
  }
  
  // Remove the azure provider from the document
  dbHelper.insertDoc(updatedUser, null, function(err, body) {
    if(body.ok) {
      // Get the full URL of root to send it to the logout endpoint
      var appUrl =  encodeURIComponent(req.protocol + '://' + req.get('host'));
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