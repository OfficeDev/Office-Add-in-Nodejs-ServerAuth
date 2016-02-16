/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

var express = require('express');
var app = express();
// load up the certificates
var certConf = require('./certconf');
// create the socket server
var socketServer = require('https').createServer(certConf, app);
// bind it to socket.io
var io = require('socket.io')(socketServer);
var dbHelper = new (require('./db/dbHelper'))();

socketServer.listen(3001);
module.exports = io;

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var AzureStrategy = require('passport-azure-ad-oauth2');
var azureConfig = require('./ws-conf').azureConf;
var googleConfig = require('./ws-conf').googleConf;
var routes = require('./routes/index');
var connect = require('./routes/connect');
var disconnect = require('./routes/disconnect');
var jwt = require('jsonwebtoken');
var ONE_DAY_MILLIS = 86400000;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

function verifyGoogle (req, accessToken, refreshToken, profile, done) {
    var user = {};
    user.sessionID = req.query.state;
    user.providerName = 'google';
    user.displayName = profile.displayName;
    user.accessToken = accessToken;
    done(null, user);
}

function verifyAzure (req, accessToken, refreshToken, params, profile, done) {
    // Azure returns an id token with basic information about the user
    var azureProfile = jwt.decode(params.id_token);

    // Create a new user object that will be available to
    // the /connect/:providerName/callback route
    var user = {};
    user.sessionID = req.query.state;
    user.providerName = 'azure';
    user.displayName = azureProfile.name;
    done(null, user);
}

// Tell passport how to use Google and Azure
passport.use(new GoogleStrategy(googleConfig, verifyGoogle));
passport.use('azure', new AzureStrategy(azureConfig, verifyAzure));

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
function error404Handler (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);    
}

app.use(error404Handler);

// error handlers

// development error handler
// will print stacktrace
function error500DevHandler (err, req, res) {
    res.status(err.status || 500);
    res.render('error', 
        {
            message: err.message,
            error: err
        }
    );
}

if (app.get('env') === 'development') {
  app.use(error500DevHandler);
}

// production error handler
// no stacktraces leaked to user
function error500ProdHandler (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
    message: err.message,
    error: {}
    });
}

app.use(error500ProdHandler);

module.exports = app;
