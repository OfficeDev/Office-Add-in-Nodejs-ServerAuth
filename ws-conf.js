/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

exports.azureConf = {
    authorizationURL: 'https://login.microsoftonline.com/common/oauth2/authorize',
    tokenURL: 'https://login.microsoftonline.com/common/oauth2/token',
    clientID: 'ENTER_YOUR_CLIENT_ID',
    clientSecret: 'ENTER_YOUR_SECRET',
    resource: 'https://graph.microsoft.com',
    callbackURL: 'https://localhost:3000/connect/azure/callback',
    passReqToCallback: true
};

exports.googleConf = {
    clientID: 'ENTER_YOUR_CLIENT_ID',
    clientSecret: 'ENTER_YOUR_SECRET',
    callbackURL: 'https://localhost:3000/connect/google/callback',
    passReqToCallback: true
};