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
  , DbHelper = require('./db-helper');

var dbHelperInstance = new DbHelper();
dbHelperInstance.insertDoc({ testField: "testValue" },
  function (err, body) {
    dbHelperInstance.destroy(function () {
      console.log("Database deleted");
    });
  });

// teach passport how to use azure
passport.use('azure', new AzureAdOAuth2Strategy(azureConfig,
  function (accessToken, refreshToken, params, profile, done) {
    // TODO why is this *never* called?
    console.log("Access token: " + accessToken);
    console.log("Refresh token: " + refreshToken);
    console.log("Id token: " + params.id_token);
    console.log('Profile: ' + JSON.stringify(profile));
    done(null, profile);
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
  console.log('serializeUser()');
  console.log("user:\n" + JSON.stringify(user));
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  console.log('deserializeUser()');
  console.log(user);
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
