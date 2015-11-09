var express = require('express')
  , router = express.Router()
  , passport = require('passport')
  , io = require('../app')
  , cookie = require("cookie")
  , cookieParser = require('cookie-parser')
  , dbHelper = new (require('../db-helper'))();

// io.on('connection', function (socket) {
//   console.log('Socket connection est');
//   var jsonCookie =
//     cookie.parse(socket
//       .handshake
//       .headers
//       .cookie);
//   var decodedNodeCookie =
//     cookieParser
//       .signedCookie(jsonCookie.nodecookie, 'keyboard cat');
//   console.log('de-signed cookie: ' + decodedNodeCookie);
//   // the sessionId becomes the room name for this session
//   socket.join(decodedNodeCookie);
//   io.to(decodedNodeCookie).emit('init', 'Private socket session established');
// });

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
      // Update the current user object in the request
      updatedUser._rev = body.rev;
      req.user = updatedUser;
      
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