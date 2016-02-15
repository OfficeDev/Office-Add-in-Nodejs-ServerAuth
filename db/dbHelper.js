/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var dbFile = './db/database.sqlite3';
var util = require('util');

var providers = [
    { $providerName: 'google', $providerNameCapitalized: 'Google' },
    { $providerName: 'azure', $providerNameCapitalized: 'Azure' }
]

function dbHelper() { }

/**
 * Create SQLite3 table UserData
 */
dbHelper.prototype.createDatabase = function createDatabase () {
    var dbExists = fs.existsSync(dbFile);
    var db = new sqlite3.Database(dbFile);
    var createUserDataStatement = 
        'CREATE TABLE UserData (' +
            'SessionID TEXT NOT NULL, ' + 
            'ProviderName TEXT NOT NULL, ' +
            'DisplayName TEXT  NOT NULL, ' +
            'AccessToken TEXT NOT NULL, ' + 
            'PRIMARY KEY (SessionID, ProviderName)' +
        ')';
    var createProviderStatement = 
        'CREATE TABLE Provider (' +
            'ProviderName TEXT NOT NULL, ' + 
            'ProviderNameCapitalized TEXT NOT NULL, ' +
            'PRIMARY KEY (ProviderName)' +
        ')';
    var insertProvidersStatement = 
        'INSERT INTO Provider (ProviderName, ProviderNameCapitalized) ' +
        'VALUES ($providerName, $providerNameCapitalized)';
        
    db.serialize(function() {
        if(!dbExists) {
            db.run(
                createUserDataStatement,
                [],
                function (error) {
                    if (error !== null) {
                        console.log('Error creating UserData table: ' + error);
                    }
                }
            );
            db.run(
                createProviderStatement,
                [],
                function (error) {
                    if (error !== null) {
                        console.log('Error creating Provider table: ' + error);
                    }
                }
            );
            
            var insertStatement = db.prepare(insertProvidersStatement);
            for(var i = 0; i < providers.length; i++) {
                insertStatement.run(providers[i]);
            }
            insertStatement.finalize();
        }
    });
    db.close();
}

/**
 * Returns an object with the providers that have an access token in the database
 * for the specified sessionID.
 */
dbHelper.prototype.getProviderDisplayNameArray = function getProviderDisplayNameArray (sessionID, callback) {
    var db = new sqlite3.Database(dbFile);
    var selectStatement = 
        'SELECT ' +
  	    'Provider.ProviderName as providerName, ' +
	    'Provider.ProviderNameCapitalized as providerNameCapitalized, ' +
	    'UserData.SessionID as sessionID, ' +
	    'UserData.DisplayName as displayName ' +
        'FROM Provider LEFT JOIN UserData  ' +
        'ON Provider.ProviderName = UserData.ProviderName  ' +
        'WHERE UserData.SessionID = $sessionID';

    db.serialize (function() {
        db.all (
            selectStatement,
            {
                $sessionID: sessionID
            },
            function (error, providerDisplayNameArray) {
                callback(error, providerDisplayNameArray);
            }
        );
    });
}

dbHelper.prototype.getUserData = function getUserData (sessionID, callback) {
    var userData = {};
    userData.sessionID = sessionID;
    
    var db = new sqlite3.Database(dbFile);
    var getUserDataStatement = 
        'SELECT ' +
        '    Provider.ProviderName as providerName, ' +
        '    Provider.ProviderNameCapitalized as providerNameCapitalized, ' +
        '    UserData.SessionID as isConnected, ' +
        '    UserData.DisplayName as displayName ' +
        'FROM Provider LEFT OUTER JOIN ( ' +
        '    SELECT SessionID, ProviderName, DisplayName FROM UserData WHERE SessionID = $sessionID) UserData ' +
        'ON Provider.ProviderName = UserData.ProviderName';

    db.serialize (function() {
        db.all (
            getUserDataStatement,
            {
                $sessionID: sessionID
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
dbHelper.prototype.saveAccessToken = function saveAccessToken (sessionID, providerName, displayName, accessToken, callback) {
    var db = new sqlite3.Database(dbFile);
    var selectStatement = 'SELECT ProviderName FROM UserData WHERE SessionID = $sessionID AND ProviderName = $providerName';
    var insertStatement = 'INSERT INTO UserData (SessionID, ProviderName, DisplayName, AccessToken) values ($sessionID, $providerName, $displayName, $accessToken)'
    var updateStatement = 'UPDATE UserData SET AccessToken = $accessToken, DisplayName = $displayName WHERE SessionID = $sessionID AND ProviderName = $providerName'

    db.serialize(function() {
        db.get (
            selectStatement,
            {
                $sessionID: sessionID,
                $providerName: providerName
            },
            function (err, row) {
                // If there are no rows, the row is 'undefined', so we should insert.
                // If there is a row, then we should update it.
                var statement = typeof(row) === 'undefined' ? insertStatement : updateStatement; 
                
                db.run (
                    statement,
                    {
                        $sessionID: sessionID,
                        $providerName: providerName,
                        $displayName: displayName,
                        $accessToken: accessToken
                    },
                    callback
                );
            }
        );
    });
}

/**
 * Insert access token to table UserData if the combination SessionID, Provider
 * does not already exists.
 * If the record exists, update it with the new access token.
 */
dbHelper.prototype.deleteAccessToken = function deleteAccessToken (sessionID, providerName, callback) {
    var db = new sqlite3.Database(dbFile);
    var deleteStatement = 'DELETE FROM UserData WHERE SessionID = $sessionID AND ProviderName = $providerName'

    db.serialize(function() {
        db.run (
            deleteStatement,
            {
                $sessionID: sessionID,
                $providerName: providerName
            },
            callback
        );
    });
}

module.exports = dbHelper;