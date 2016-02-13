/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var dbFile = './db/database.sqlite3';
var util = require('util');

function dbHelper() { }

/**
 * Create SQLite3 table UserData
 */
dbHelper.prototype.createDatabase = function createDatabase () {
    var dbExists = fs.existsSync(dbFile);
    var db = new sqlite3.Database(dbFile);
    var createTableStatement = 
        'CREATE TABLE UserData (' +
            'SessionID TEXT NOT NULL, ' + 
            'Provider TEXT  NOT NULL, ' +
            'DisplayName TEXT  NOT NULL, ' +
            'AccessToken TEXT NOT NULL, ' + 
            'PRIMARY KEY (SessionID, Provider)' +
        ');';

    db.serialize(function() {
        if(!dbExists) {
            db.run(
                createTableStatement,
                [],
                function (error) {
                    if (error !== null) {
                        console.log('Error creating UserData table: ' + error);
                    }
                }
                );
        }
    });
    db.close();
}

/**
 * Returns an object with the providers that have an access token in the database
 * for the specified sessionId.
 */
dbHelper.prototype.getProviderDisplayNameArray = function getProviderDisplayNameArray (sessionId, callback) {
    var db = new sqlite3.Database(dbFile);
    var selectStatement = 
        'SELECT Provider AS providerName, DisplayName as displayName FROM UserData WHERE SessionID = $sessionId';

    db.serialize (function() {
        db.all (
            selectStatement,
            {
                $sessionId: sessionId
            },
            function (error, providerDisplayNameArray) {
                callback(error, providerDisplayNameArray);
            }
        );
    });
}

dbHelper.prototype.getUserData = function getUserData (sessionId, callback) {
    var userData = {};
    userData.sessionId = sessionId;
    
    var db = new sqlite3.Database(dbFile);
    var getUserDataStatement = 
        'SELECT Provider AS providerName, DisplayName as displayName FROM UserData WHERE SessionID = $sessionId';

    db.serialize (function() {
        db.all (
            getUserDataStatement,
            {
                $sessionId: sessionId
            },
            function (error, providerDisplayNameArray) {
                userData.providers = providerDisplayNameArray;
                console.log('Userdata: ' + util.inspect(userData, false, null));
                callback(error, userData);
            }
        );
    });
}

/**
 * Insert access token to table UserData if the combination SessionID, Provider
 * does not already exists.
 * If the record exists, update it with the new access token.
 */
dbHelper.prototype.saveAccessTokenGetUserData = function saveAccessTokenGetUserData (sessionId, provider, displayName, accessToken, callback) {
    var db = new sqlite3.Database(dbFile);
    var selectStatement = 'SELECT Provider FROM UserData WHERE SessionID = $sessionId AND Provider = $provider';
    var insertStatement = 'INSERT INTO UserData (SessionID, Provider, DisplayName, AccessToken) values ($sessionId, $provider, $displayName, $accessToken)'
    var updateStatement = 'UPDATE UserData SET AccessToken = $accessToken, DisplayName = $displayName WHERE SessionID = $sessionId AND Provider = $provider'
    var userDataStatement = 'SELECT Provider AS providerName, DisplayName as displayName FROM UserData WHERE SessionID = $sessionId';

    db.serialize(function() {
        db.get (
            selectStatement,
            {
                $sessionId: sessionId,
                $provider: provider
            },
            function (err, row) {
                // If there are no rows, the row is 'undefined', so we should insert.
                // If there is a row, then we should update it.
                var statement = typeof(row) === 'undefined' ? insertStatement : updateStatement; 
                
                db.run (
                    statement,
                    {
                        $sessionId: sessionId,
                        $provider: provider,
                        $displayName: displayName,
                        $accessToken: accessToken
                    }
                );
                
                db.all (
                    userDataStatement,
                    {
                        $sessionId: sessionId
                    },
                    function (error, providerDisplayNameArray) {
                        var userData = {};
                        userData.sessionId = sessionId;
                        userData.providers = providerDisplayNameArray;
                        console.log('Userdata: ' + util.inspect(userData, false, null));
                        callback(error, userData);
                    }
                );
            }
        );
    });
}

module.exports = dbHelper;