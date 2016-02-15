/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

var express = require('express')
  , router = express.Router();
var dbHelper = new(require('../db/dbHelper'))();

/* GET home page. */
router.get('/', function (req, res) {
    dbHelper.getUserData(req.sessionID, function (error, userData) {
        if (error !== null) {
            console.log('Route index error: ' + error);
        } else {
            userData.sessionID = req.sessionID;
            res.render('index', userData);
        } 
    });
});

module.exports = router;
