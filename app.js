/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

var express = require('express')
  , app = express()
// load up the certificates
  , certConf = require('./certconf')
// create the socket server
  , socketServer = require('https').createServer(certConf, app)
// bind it to socket.io
  , io = require('socket.io')(socketServer);
var dbHelper = new (require('./db/dbHelper'))(); 

socketServer.listen(3001);
module.exports = io;

var path = require('path')
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , passport = require('passport')
  , session = require('express-session')
  , AzureStrategy = require('passport-azure-ad-oauth2')
  , azureConfig = require('./ws-conf').azureConf
  , googleConfig = require('./ws-conf').googleConf
  , routes = require('./routes/index')
  , connect = require('./routes/connect')
  , disconnect = require('./routes/disconnect')
  , jwt = require('jsonwebtoken')
  , ONE_DAY_MILLIS = 86400000
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// Tell passport how to use Google
passport.use(new GoogleStrategy(
    googleConfig,
    function (req, accessToken, refreshToken, profile, done) {
        dbHelper.saveAccessToken (
            req.query.state, // This is the sessionID
            'google',
            profile.displayName,
            accessToken, 
            function (error) {
                if (error) {
                    done (error);
                } else {
                    var user = {};
                    user.sessionID = req.query.state;
                    user.providerName = 'google';
                    user.displayName = profile.displayName;
                    done(null, user);
                }
            }
        );
    })
);

// Tell passport how to use Azure
passport.use('azure', new AzureStrategy(azureConfig,
    function (req, accessToken, refreshToken, params, profile, done) {
        var azureProfile = jwt.decode(params.id_token);
        dbHelper.saveAccessToken (
            req.query.state, // This is the sessionID
            'azure',
            azureProfile.name,
            accessToken, 
            function (error) {
                if (error === null) {
                    var user = {};
                    user.sessionID = req.query.state;
                    user.providerName = 'azure';
                    user.displayName = azureProfile.name;
                    done(null, user);
                }
            }
        ); 
    })
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

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
app.use(favicon(path.join(__dirname + '/public/images/favicon.ico')));

app.use('/', routes);
app.use('/connect', connect);
app.use('/disconnect', disconnect);

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
