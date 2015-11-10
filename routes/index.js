var express = require('express')
  , router = express.Router()
  , dbHelper = new (require('../db-helper'))();

/* GET home page. */
router.get('/', function (req, res, next) {
  var user = req.user;
  var userState = {
    title: 'Express',
    azure: false,
    google: false
  };
  if (user) {
    console.log('session found');
    assessUserState(userState, user);
    console.log(JSON.stringify(user));
    res.render('index', userState);
    console.log("Requestor: [" + req.sessionID + "]");
  } else {
    console.log('no sessionfound');
    dbHelper.getUser(req.sessionID, function (err, user) {
      req.user = user;
      assessUserState(userState, user);
      res.render('index', userState);
      console.log("Requestor: [" + req.sessionID + "]");
    });
  }
});

function assessUserState(state, user) {
  if (user) {
    var azure = getServiceByName(user, 'azure');
    if (azure) {
      state.azureName = azure.name;
    }
    if (getServiceByName(user, 'azure') && isValid(user, 'azure')) {
      state.azure = true;
    } else if (getServiceByName(user, 'google') && isValid(user, 'google')) {
      state.google = true;
    }
  }
}

// TODO method stub
function isValid(user, service) {
  var provider = getServiceByName(user, service);
  console.log("Found service - " + JSON.stringify(provider));
  var currentTimeSeconds = Math.round(new Date().getTime() / 1000);
  if (currentTimeSeconds < provider.accessTokenExpiry) {
    console.log('token: valid');
    return true;
  } else {
    console.error('token: expired');
    dbHelper.deleteUser(user);
  }
  return false;
}

function getServiceByName(user, serviceName) {
  var service;
  if (user.providers) {
    user.providers.forEach(function (provider) {
      if (serviceName === provider.providerName) {
        console.log('Found service: ' + serviceName);
        service = provider;
      }
    });
  }
  return service;
}

module.exports = router;
