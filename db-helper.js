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
	db.list({ sessid: sessid }, function (err, body) {
		if (err) {
			console.error("Error: " + err);
			callback(err, body);
		} else {
			console.log('Found record: ' + JSON.stringify(body));
			if (1 === body.total_rows) {
				var userRecord = body.rows[0].id;
				db.get(userRecord, function (err, body) {
					callback(err, body);
				});
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
						_insertDoc(doc, params, ++tried, callback);
					});
				} else {
					console
						.error("Giving up - Tries: [" + tried + "] - error:\n" + err);
					callback(err, body);
				}
			} else {
				console.log("Record inserted");
				callback(err, body);
			}
		});
}

module.exports = DbHelper