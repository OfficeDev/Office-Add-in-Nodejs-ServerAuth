/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

var express = require('express')
  , router = express.Router();
var util = require('util');
var dbHelper = new(require('../db/dbHelper'))();

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log('Main session ID: ' + req.sessionID);
    
    dbHelper.getUserData(req.sessionID, function (error, userData) {
        if (error !== null) {
            console.log('Route index error: ' + error);
        } else {
            console.log('UserData: ' + util.inspect(userData, false, null));
            
            // Formatting the data so it's easier to render with Jade
            for (var i = 0; userData.providers.length; i++) {
                userData[userData.providers[i].providerName] = userData.providers[i];
            }
        
            res.render('index', userData);
        } 
    });
});

module.exports = router;
