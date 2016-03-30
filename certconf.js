/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

var fs = require('fs');
var cert = {
  // the private key
  key: fs.readFileSync(__dirname + '/server.key'),
  // the public cert
  cert: fs.readFileSync(__dirname + '/server.crt')
};

module.exports = cert;
