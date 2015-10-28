# Legend
|What|Symbol|
|---|---|
|Add-In Pane|`AIP`|
|Add-In Server|`AIS`|
|Arbitrary OAuth 2.0 Provider|`OAP`|
|Auth Pop-Up|`APUP`|
|Persistent session id (`AIP` / `AIS`)|`SESSID`|

# First run flow

1. `AIP` does `GET /` to `AIS` over HTTPS
2. `AIS` generates [**persistent**](https://en.wikipedia.org/wiki/HTTP_cookie#Persistent_cookie) session id, we'll call this `SESSID`
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

5. User enters credentials into `APUP`
6. User grants consent via `APUP`
7. `OAP` redirects to `redirect_uri` on `AIS` w/ authorization code
    `https://localhost:3000/OAuth/AuthCode/<SESSID>/<SOCKETID>?code=<CODE>`
8. Redirect triggers load of new script in `APUP` to self-close via `window.close()`
9. `AIS` uses authorization code to negotiate access & refresh w/ `OAP` via AJAJ<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;Once done, `AIS` has the following:<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- `client_id` (always - created @ registration)<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- `client_secret` (always - created @ registration)<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- `code` (acquired by step #7)<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- `access_token` (just now)<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- `refresh_token` (just now)<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- `id_token` (just now)<br/>
10. `AIS` creates a new record for the authenticated user

    |`SESSID`|`access_token`|`access_token_expiry`|`refresh_token`|`refresh_token_expiry`
    |---|---|---|---|---|
    |GUID|GUID|DateTime|GUID| DateTime|

11. `AIS` 'calls back' to `AIP` via websocket (#4) to inform 'ready' state (redraw, reload, do whatever)
12. (...eventually) `AIP` makes request to `AIS`, credentials are rehydrated from datastore, request is proxied, returns result over HTTPS
