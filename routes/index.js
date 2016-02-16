/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

var express = require('express');
var router = express.Router();
var dbHelper = new(require('../db/dbHelper'))();

/* GET home page. */
router.get('/', function handleRequest(req, res) {
  dbHelper.getUserData(req.sessionID, function callback(error, userData) {
    if (error !== null) {
      throw error;
    } else {
      userData.sessionID = req.sessionID;
      res.render('index', userData);
    }
  });
});

module.exports = router;
