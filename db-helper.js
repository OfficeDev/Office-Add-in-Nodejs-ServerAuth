/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

var nano = require('nano')('http://localhost:5984')
	, dbName = "user-session"
	, db = nano.use(dbName);

function DbHelper() { }

DbHelper.prototype.insertDoc = function insertDoc(doc, params, callback) {
	_insertDoc(doc, params, 0, callback);
};

DbHelper.prototype.destroy = function destroy(callback) {
	nano.db.destroy(dbName, callback);
};

DbHelper.prototype.getUser = function getUser(sessid, callback) {
	console.log('user session: ' + sessid);

	// open the view
	db.view('user-sessions', 'by_sessionID', {
		keys: [
			sessid
		]
	}, function (err, body) {
		if (err || !body || !body.rows) {
			console.log("getUser: " + err);
			callback(err, body);
		} else {
			console.log("getUser: " + JSON.stringify(body));
			if (body.rows.length == 1) {
				callback(err, body.rows[0].value);
			} else {
				callback(err, null);
			}
		}
	});
};

DbHelper.prototype.deleteUser = function (user, callback) {
	db.destroy(user._id, user._rev, callback);
}

// internal
function _insertDoc(doc, params, tried, callback) {
	db.insert(doc, params,
		function (err, body) {
			if (err) {
				if (err.message === 'no_db_file' && tried < 1) {
					console.log("creating db");
					return nano.db.create(dbName, function () {
						console.log("reattempting insert")
						// create the view we will need to lookup users later
						db.insert({
							views: {
								by_sessionID: {
									map: function (doc) { if (doc.sessid) { emit(doc.sessid, doc); } }
								}
							}
						}, '_design/user-sessions', function (err, body) {
							_insertDoc(doc, params, ++tried, callback);
						});
					});
				} else {
					console
						.error('Giving up - Tries: [' + tried + '] - error:\n' + err);
					callback(err, body);
				}
			} else {
				console.log('Record inserted');
				callback(err, body);
			}
		});
}

module.exports = DbHelper