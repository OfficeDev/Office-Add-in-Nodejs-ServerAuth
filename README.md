# Legend
|What|Symbol|
|---|---|
|Add-In Pane|`AIP`|
|Add-In Server|`AIS`|
|Arbitrary OAuth 2.0 Provider|`OAP`|
|Auth Pop-Up|`APUP`|
|Persistent session id (`AIP` / `AIS`)|`SESSID`|


# First run flow

1. `AIP` does `GET /` to `AIS`
2. `AIS` generates persistent session id, we'll call this `SESSID`
3. `AIS` serves `AIP` with `/` and `Set-Cookie: <SESSID>`
4. User clicks `signIn()` in `AIP`

```javascript
function signIn() {
    // open a socket connection AIS
    openSocket('https://localhost.com:3001/', function(connection){
        var socketId = connection.socketId;
        // open a pop-up for auth
        window.open('/connect/azure/' + document.cookie + '/' + socketId);
        
        /* AIS will parse & redirect this request so the url looks something like:
         https://login.microsoftonline.com/common/oauth2/authorize?
         client_id= + CLIENT_ID
         &resource=https://graph.microsoft.com/
         &response_type=code
         &redirect_uri=https://localhost:3000/OAuth/AuthCode/<SESSID>/<SOCKETID>
         */
    });
}
```

5. `APUP` - User enters credentials
6. `APUP` - User grants consent (if necessary)
