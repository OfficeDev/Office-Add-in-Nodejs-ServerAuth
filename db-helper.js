var nano = require('nano')('http://localhost:5984')
	, dbName = "user-session"
	, db = nano.use(dbName);

function DbHelper() { }

DbHelper.prototype.insertDoc = function insertDoc(doc, callback) {
	_insertDoc(doc, 0, callback);
};

DbHelper.prototype.destroy = function destroy(callback) {
	nano.db.destroy(dbName, callback);
};

DbHelper.prototype.getUser = function getUser(userId, callback) {
	db.get(userId, function (err, body) {
		callback(err, body);
	});
};

// internal
function _insertDoc(doc, tried, callback) {
	db.insert(doc,
		function (err, body) {
			if (err) {
				if (err.message === 'no_db_file' && tried < 1) {
					console.log("creating db");
					return nano.db.create(dbName, function () {
						console.log("reattempting insert")
						_insertDoc(doc, ++tried, callback);
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