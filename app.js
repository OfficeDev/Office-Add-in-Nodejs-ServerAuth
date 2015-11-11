var express = require('express')
  , app = express()
// load up the certificates
  , certConf = require('./certconf')
// create the socket server
  , socketServer = require('https').createServer(certConf, app)
// bind it to socket.io
  , io = require('socket.io')(socketServer);

socketServer.listen(3001);
module.exports = io;

var path = require('path')
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , passport = require('passport')
  , session = require('express-session')
  , AzureAdOAuth2Strategy = require('passport-azure-ad-oauth2')
  , azureConfig = require('./ws-conf').azureConf
  , googleConfig = require('./ws-conf').googleConf
  , routes = require('./routes/index')
  , connect = require('./routes/connect')
  , disconnect = require('./routes/disconnect')
  , dbHelperInstance = new (require('./db-helper'))()
  , jwt = require('jsonwebtoken')
  , ONE_DAY_MILLIS = 86400000
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// teach passport how to use Google
passport.use(new GoogleStrategy(googleConfig,
  function (accessToken, refreshToken, profile, done) {
    console.log('google accessToken: ' + accessToken);
    console.log('google refresh token: ' + refreshToken);
    console.log('google profile: ' + JSON.stringify(profile));
    // TODO - what needs to be done now?
    // ok - what needs to be done now...
    // redirect the auth window to close
    // serialize the google user into the session
    // signal the client window (via socket) to update
    // update the user record in the db
    return done(null, {});
  }
  ));

// teach passport how to use azure
passport.use('azure', new AzureAdOAuth2Strategy(azureConfig,
  function (req, accessToken, refreshToken, params, profile, done) {
    var aadProfile = jwt.decode(params.id_token);
    
    // Extract the access token expiration date as a unix
    // (millis) timestamp
    var accessTokenExpiry =
      jwt.decode(accessToken, { complete: true }).payload.exp;

    var userData = req.user || {};
    if (!userData.sessid) {
      userData.sessid = req.sessionID;
    }

    if (!userData.providers) {
      userData.providers = [];
    }

    userData.providers.push({
      accessToken: accessToken,
      providerName: 'azure',
      accessTokenExpiry: accessTokenExpiry,
      refreshToken: refreshToken,
      familyName: aadProfile.family_name,
      givenName: aadProfile.given_name,
      name: aadProfile.name,
      uniqueName: aadProfile.unique_name,
      ver: aadProfile.ver
    });

    dbHelperInstance.insertDoc(userData, null,
      function (err, body) {
        if (!err) {
          console.log("Inserted session entry [" + userData.sessid + "] id: " + body.id);
        }
        done(null, userData);
      });
  }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  name: 'nodecookie',
  cookie: {
    path: '/',
    httpOnly: false,
    secure: false,
    maxAge: 7 * ONE_DAY_MILLIS
  },
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/connect', connect);
app.use('/disconnect', disconnect);

passport.serializeUser(function (user, done) {
  // keep those sessions light!
  done(null, user.sessid);
});

passport.deserializeUser(function (sessid, done) {
  dbHelperInstance.getUser(sessid, function (err, user) {
    done(null, user);
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
