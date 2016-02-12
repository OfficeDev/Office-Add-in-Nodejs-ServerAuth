/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

var express = require('express')
  , router = express.Router();
var util = require('util');

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log('Main session ID: ' + req.sessionID);
    console.log('Main session: ' + util.inspect(req.session, false, null));
    var userState = {
        sessionID : req.sessionID,
        azure: req.session.azureAccessToken ? true : false,
        google: req.session.googleAccessToken ? true : false
    };
    console.log('UserState: ' + util.inspect(userState, false, null));
    
    res.render('index', userState);
});

module.exports = router;
