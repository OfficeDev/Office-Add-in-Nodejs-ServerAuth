/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

exports.azureConf = {
    authorizationURL: 'https://login.microsoftonline.com/common/oauth2/authorize',
    tokenURL: 'https://login.microsoftonline.com/common/oauth2/token',
    clientID: '656bfacf-5d64-418d-97dd-963e72d413de',
    clientSecret: 'OXr1ELYueLaVGTFmfsZjoUO37pCYNSqKTG0iOnJXcDA=',
    resource: 'https://graph.microsoft.com',
    callbackURL: 'https://localhost:3000/connect/azure/callback',
    passReqToCallback: true
};

exports.googleConf = {
    clientID: '966609587541-c3j11ichfkpue01hv3ghqo2hj0la8aab.apps.googleusercontent.com',
    clientSecret: '2mvi7XnsyGZJ0fnmmIqN-FWs',
    callbackURL: 'https://localhost:3000/connect/google/callback',
    passReqToCallback: true
};