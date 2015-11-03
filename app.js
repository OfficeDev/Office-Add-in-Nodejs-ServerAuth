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
  , routes = require('./routes/index')
  , connect = require('./routes/connect')
  , DbHelper = require('./db-helper')
  , dbHelperInstance = new DbHelper()
  , jwt = require('jsonwebtoken');

// teach passport how to use azure
passport.use('azure', new AzureAdOAuth2Strategy(azureConfig,
  function (accessToken, refreshToken, params, profile, done) {
    var aadProfile = jwt.decode(params.id_token);

    var userSession = {
      accessToken: accessToken,
      refreshToken: refreshToken,
      family_name: aadProfile.family_name,
      given_name: aadProfile.given_name,
      name: aadProfile.name,
      unique_name: aadProfile.unique_name,
      ver: aadProfile.ver
    }
    
    // TODO persist this object - just testing for now...
    // So I reckon what happens is that I can insert a record and
    // then put that object on the user session so I can rehydrate
    // that user later
    dbHelperInstance.insertDoc(userSession,
      function (err, body) {
        if (!err) {
          console.log("Inserted [" + userSession.name + "] id: " + body.id);
          // include the db id in the user session for lookup?
          userSession.id = body.id;
        }
        dbHelperInstance.destroy(function () {
          console.log("Database deleted");
        });
        done(null, userSession);
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
    maxAge: null
  },
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/connect', connect);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
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
