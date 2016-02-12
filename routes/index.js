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
    console.log('Main session: ' + util.inspect(req.session, false, null));
    
    dbHelper.getProviderDisplayNameArray(req.sessionID, function (providerDisplayNameArray) {
        var userState = {
            sessionID : req.sessionID
        };
        
        // Create properties for each provider found in the database
        // For example: 
        //  userState.azure, userState.azureName
        //  userState.google, userState.googleName....
        for (var i = 0; i < providerDisplayNameArray.length; i++) {
            console.log('Provider: ' + providerDisplayNameArray[i].Provider);
            userState[providerDisplayNameArray[i].Provider] = true;
            userState[providerDisplayNameArray[i].Provider + 'Name'] = providerDisplayNameArray[i].DisplayName;
        }
        console.log('UserState: ' + util.inspect(userState, false, null));
    
        res.render('index', userState); 
    });
});

module.exports = router;
