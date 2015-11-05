var express = require('express');
var router = express.Router();

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
  var userState = {
    title: 'Express',
    azure: false,
    google: false
  };
  if (userHasSessionAssociator(sid)) {
    if (hasService('azure', sid) && isValid('azure', sid)) {
      userState.azure = true;
    } else if (hasService('google', sid) && isValid('google', sid)) {
      userState.google = true;
    }
  }
  res.render('index', userState);
  console.log("Requestor: [" + req.sessionID + "]");
});

// TODO method stub
function isValid(service, sessionID) {
  return true;
}

// TODO method stub
function hasService(service, sessionID) {
  return false;
}

// TODO method stub
function userHasSessionAssociator(sessionID) {
  return true;
}

module.exports = router;
