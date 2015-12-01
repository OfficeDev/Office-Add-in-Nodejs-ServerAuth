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
    clientSecret: '3XzN7EhwX5tVa29w_E5hTxvh',
    callbackURL: "https://localhost:3000/connect/auth/google/callback",
    passReqToCallback: true
};