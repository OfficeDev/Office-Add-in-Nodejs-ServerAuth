var express = require('express')
  , router = express.Router()
  , dbHelper = new (require('../db-helper'))();

/* GET home page. */
router.get('/', function (req, res, next) {
  // get the session, does the user have one?
  /*
  PULL THE USER STATE FROM THE DATA STORE CHECK THE PROVIDER AND STUFF
  ALSO PUT THE PROVIDER IN THE DATA STORE
  HOOKUP THE LOGOUT
  DELETE TOKENS IF THEYRE EXPIRED
  */
  var sid = req.sessionID;
  var user = req.user;
  if (user) {
    console.log(JSON.stringify(user));
  } else {
    console.error("No user found");
  }
  var userState = {
    title: 'Express',
    azure: false,
    google: false
  };
  if (user) {
    if (hasProvider(user, 'azure') && isValid('azure', sid)) {
      userState.azure = true;
    } else if (hasProvider(user, 'google') && isValid('google', sid)) {
      userState.google = true;
    }
  }
  res.render('index', userState);
  console.log("Requestor: [" + req.sessionID + "]");
});

function hasProvider(user, sought) {
  var hasProvider;
  if (user.providers) {
    user.providers.forEach(function (provider) {
      console.log('name: ' + provider.providerName);
      if (provider.providerName === sought) {
        hasProvider = true;
      }
    });
  }
  return hasProvider;
}

// TODO method stub
function isValid(service, sessionID) {
  return true;
}

module.exports = router;
