/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var dbFile = './db/database.sqlite3';

var providers = [
    { $providerName: 'google', $providerNameCapitalized: 'Google' },
    { $providerName: 'azure', $providerNameCapitalized: 'Azure' }
];

function dbHelper() { }

/**
 * Create SQLite3 table UserData
 */
dbHelper.prototype.createDatabase = function createDatabase() {
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

  db.serialize(function createTables() {
    var insertStatement;
    var i;

    if (!dbExists) {
      db.run(
                createUserDataStatement,
                [],
                function callback(error) {
                  if (error !== null) {
                    throw error;
                  }
                }
            );
      db.run(
                createProviderStatement,
                [],
                function callback(error) {
                  if (error !== null) {
                    throw error;
                  }
                }
            );

      insertStatement = db.prepare(insertProvidersStatement);
      for (i = 0; i < providers.length; i++) {
        insertStatement.run(providers[i]);
      }
      insertStatement.finalize();
    }
  });
  db.close();
};

dbHelper.prototype.getUserData = function getUserData(sessionID, callback) {
  var userData = {};
  var db = new sqlite3.Database(dbFile);
  var getUserDataStatement =
        'SELECT ' +
        '    Provider.ProviderName as providerName, ' +
        '    Provider.ProviderNameCapitalized as providerNameCapitalized, ' +
        '    UserData.SessionID as isConnected, ' +
        '    UserData.DisplayName as displayName ' +
        'FROM Provider LEFT OUTER JOIN ( ' +
        '    SELECT SessionID, ProviderName, DisplayName ' +
        '    FROM UserData WHERE SessionID = $sessionID) UserData ' +
        'ON Provider.ProviderName = UserData.ProviderName';

  userData.sessionID = sessionID;

  db.serialize(function executeSelect() {
    db.all(
            getUserDataStatement,
      {
        $sessionID: sessionID
      },
            function queryExecuted(error, providerDisplayNameArray) {
              userData.providers = providerDisplayNameArray;
              callback(error, userData);
            }
        );
  });
};

dbHelper.prototype.saveAccessToken =
    function saveAccessToken(sessionID, providerName, displayName, accessToken, callback) {
      var db = new sqlite3.Database(dbFile);
      var insertStatement = 'INSERT INTO UserData ' +
                            '(SessionID, ProviderName, DisplayName, AccessToken) ' +
                            'VALUES ($sessionID, $providerName, $displayName, $accessToken)';

      db.serialize(function executeInsert() {
        db.run(
            insertStatement,
          {
            $sessionID: sessionID,
            $providerName: providerName,
            $displayName: displayName,
            $accessToken: accessToken
          },
            callback
        );
      });
    };

dbHelper.prototype.deleteAccessToken =
    function deleteAccessToken(sessionID, providerName, callback) {
      var db = new sqlite3.Database(dbFile);
      var deleteStatement = 'DELETE FROM UserData WHERE ' +
                          'SessionID = $sessionID AND ProviderName = $providerName';

      db.serialize(function executeDelete() {
        db.run(
            deleteStatement,
          {
            $sessionID: sessionID,
            $providerName: providerName
          },
            callback
        );
      });
    };

module.exports = dbHelper;
