/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var dbFile = './db/database.sqlite3';

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
        'SELECT Provider, DisplayName FROM UserData WHERE SessionID = @sessionId';

    db.serialize (function() {
        db.all (
            selectStatement,
            {
                "@sessionId": sessionId
            },
            function (error, providerDisplayNameArray) {
                if (error !== null) {
                    console.log('Error getting providers: ' + error);
                } else {
                    callback(providerDisplayNameArray);
                }
            }
        );
    });
    db.close();
}

/**
 * Insert access token to table UserData if the combination SessionID, Provider
 * does not already exists.
 * If the record exists, update it with the new access token.
 */
dbHelper.prototype.saveAccessToken = function saveAccessToken (sessionId, provider, accessToken) {
    var db = new sqlite3.Database(dbFile);
    var insertOrUpdateStatement = 
        'if exists (SELECT Provider FROM UserData WHERE SessionID = @sessionId AND Provider = @provider)' +
        'begin ' + 
            'UPDATE UserData SET AccessToken = $accessToken WHERE SessionID = @sessionId AND Provider = @provider' +
        'end ' +    
        'else ' +
        'begin ' +
            'INSERT INTO UserData (SessionID, Provider, AccessToken) values (@sessionId, $provider, $accessToken) ' +
        'end';

    db.serialize(function() {
        db.run(
            insertOrUpdateStatement,
            {
                "@sessionId": sessionId,
                "@provider": provider,
                "@accessToken": accessToken
            }
        );
    });
    db.close();
}

module.exports = dbHelper;