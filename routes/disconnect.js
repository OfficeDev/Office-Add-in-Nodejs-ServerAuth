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
  // Destroy the cookies related to the service
  
  // Update the document in the DB
  
  // Redirect to 
  // Get the full URL of root to send it to the logout endpoint
  var appUrl =  encodeURIComponent(req.protocol + '://' + req.get('host'));
  var redirectUrl = 
  'https://login.microsoftonline.com/common/oauth2/logout' + 
  '?post_logout_redirect_uri=' + appUrl; 
  console.log(redirectUrl);  
  res.redirect(redirectUrl);
});

module.exports = router;