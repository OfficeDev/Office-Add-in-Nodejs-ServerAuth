var fs = require('fs')
	, cert = {
		// the private key
		key: fs.readFileSync(__dirname + '/server.key'),
		// the public cert
		cert: fs.readFileSync(__dirname + '/server.crt')
	};

module.exports = cert;