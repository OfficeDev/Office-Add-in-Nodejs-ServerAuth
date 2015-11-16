exports.azureConf = {
    authorizationURL: 'https://login.microsoftonline.com/ed46058a-1957-405e-8d5a-fae110f41cb8/oauth2/authorize',
    tokenURL: 'https://login.microsoftonline.com/ed46058a-1957-405e-8d5a-fae110f41cb8/oauth2/token',
    clientID: '656bfacf-5d64-418d-97dd-963e72d413de',
    clientSecret: 'OXr1ELYueLaVGTFmfsZjoUO37pCYNSqKTG0iOnJXcDA=',
    resource: 'https://graph.microsoft.com',
    callbackURL: 'https://serverauth.azurewebsites.net/connect/azure/callback',
    passReqToCallback: true
};

exports.googleConf = {
    clientID: '117889876896-kaof7v5q7ojbna4b9r2tn2hjfq7rq3gl.apps.googleusercontent.com',
    clientSecret: 'JB4MzfhANwhphySLpQUQhavv',
    callbackURL: "https://localhost:3000/connect/auth/google/callback",
    passReqToCallback: true
};