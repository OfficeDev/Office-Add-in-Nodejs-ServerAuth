# Office Add-in Server Authentication Sample for NodeJS

[![Build Status](https://travis-ci.org/OfficeDev/Office-Add-in-NodeJS-ServerAuth.svg?branch=master)](https://travis-ci.org/OfficeDev/Office-Add-in-NodeJS-ServerAuth)

A goal of many Office Add-in is to improve user productivity, you can get closer to achieve this goal with the help of 3rd party services. Most of today services implement the OAuth 2.0 specification to allow other applications into the user data.

![Office Add-in Server Authentication Sample screenshot](/readme-images/Office-Add-in-NodeJS-ServerAuth.png)

You must keep in mind that Office Add-ins run in a variety of platforms and devices. This presents a great opportunity for your add-in, but you must be aware of the following considerations when you try to make OAuth flows work across a combination of platforms and technologies.

## Design considerations

Some versions of Office use an iframe to display the add-in. This poses an inconvenience for OAuth flows. The authentication flow in OAuth uses a sign-in page that can't be displayed in an iframe. The reason behind is to minimize the risk that a malicious page takes control of the sign-in page. Your add-in should not try to display the OAuth sign-in page in the main add-in window.

**Solution:** Start the OAuth flow from a pop-up page.

After the OAuth flow is done, you might want to pass the tokens to your main add-in page and use them to make API calls to the 3rd party service. 
Some browsers, most notably Internet Explorer, have the concept of security zones. If pages are in different security zones, you'll have some difficulty passing the tokens from the pop-up page to the main page.

**Solution:** Store the tokens in a database and make the API calls from your server instead. Enable server-side communication via sockets to send the results. There are many libraries that make it easy to communicate between the server and the browser. This sample uses [Socket.io](http://socket.io) to notify the main add-in page that the OAuth flow is done.

Because of the security zones mentioned previously, we can't ensure that the pop-up and the main add-in page share the same session identifier in your add-in. If this is the case, the add-in server doesn't have a way to determine what main add-in page it needs to notify.

**Solution:** Use the main page session id to identify the browser session. If you have to open a pop-up, send the session identifier as part of the path or query string.

Your add-in must reliably identify the browser session that started the OAuth flow. When the flow returns to the configured redirect URI your add-in needs to decide what browser session owns the tokens. If your add-in pages are in different security zones, the add-in will not be able to assign the tokens to the right browser session.

**Solution:** Use the state parameter in the OAuth flow to identify the session that owns the tokens. Further discussion about this technique can be found in [Encoding claims in the OAuth 2 state parameter using a JWT](https://tools.ietf.org/html/draft-bradley-oauth-jwt-encoded-state-04). 

> **Note:** <br /> The OAuth 2.0 authorization protocol specifies that the authorization server should perform an exact string comparison of the redirect_uri parameter with the redirect_uri value registered by the client. For this reason, you shouldn't attach query string parameters or additional path elements to the redirect_uri. 

As an additional security measure, this sample deletes tokens from the database after two minutes of requesting them. You should implement token storage policies according to your application requirements.

## Prerequisites

To use the Office Add-in Server Authentication sample, you need the following:

* [Node.js](https://nodejs.org/) is required to run the sample. The sample has been tested on Node.js version 4.2.1.
* [CouchDB](https://couchdb.apache.org) version 1.5.1 or greater.
* The dependencies require Python version 2.7 and XCode version 6.3 or greater (Mac) or Visual Studio Express 2015 with C++ features installed (Windows).
* App registration in Azure and/or Google services. Azure Active Directory (AD) and Google APIs provide identity services that applications use for authentication and authorization.
    * You can use an [Azure trial subscription](https://account.windowsazure.com/SignUp) to register your app. The sample requires the **Windows Azure Active Directory** > **Sign in and read user profile** delegated permission, which is assigned by default. Add **https://localhost:3000/connect/azure/callback** to the list of reply URLs.
    * You can register your app in [Google Developers Console](https://console.developers.google.com/). The sample requires the **Google+ API** to be enabled. Add **https://localhost:3000/connect/google/callback** to the list of authorized redirect URIs.
* A ```client ID``` and ```secret``` values of an application registered in Azure and/or Google.

## Deploy the add-in

See [Create a network shared folder catalog for task pane and content add-ins](https://msdn.microsoft.com/library/office/fp123503.aspx) to install the add-in to your Office desktop applications or [Publish task pane and content add-ins to an add-in catalog on SharePoint](https://msdn.microsoft.com/library/office/fp123517.aspx) if you want to install the add-in to your organization's add-in catalog.

## Configure and run the app

1. Use a text editor to open ```ws-conf.js```.
2. Replace *ENTER_YOUR_CLIENT_ID* with the client ID of your registered Azure or Google application.
3. Replace *ENTER_YOUR_SECRET* with the client secret of your registered Azure or Google application.
4. Install the dependencies running the following command:
    ```
    npm install
    ```

5. Start the application with the following command:
    ```
    npm start
    ```

    > **Note:** <br />
    The sample uses a self-signed certificate to serve the site using the https protocol. The sample requires you to trust the certificate to run properly. You can also generate your own self-signed certificate using the **ss_certgen.sh** script, which requires [OpenSSL](http://www.openssl.org/) to run.
6. Open Word or Excel and click **Insert** > **My add-ins** > **See all...**    
7. Click **Shared Folder** if you deployed the add-in to a network share or **My Organization** if you deployed the add-in to the add-in catalog.
8. Click **ServerAuth Sample**.

## Questions and comments

We'd love to get your feedback about this sample. You can send your questions and suggestions to us in the [Issues](https://github.com/OfficeDev/Office-Add-in-NodeJS-ServerAuth/issues) section of this repository.

Questions about Office 365 development in general should be posted to [Stack Overflow](http://stackoverflow.com/questions/tagged/office-addins). Make sure that your questions or comments are tagged with [office-addins].
  
## Additional resources

* [More Add-in samples](https://github.com/OfficeDev?utf8=%E2%9C%93&query=-Add-in)
* [Office Add-ins](http://msdn.microsoft.com/library/office/jj220060.aspx)
* [Anatomy of an Add-in](https://msdn.microsoft.com/library/office/jj220082.aspx#StartBuildingApps_AnatomyofApp)

## Copyright
Copyright (c) 2015 Microsoft. All rights reserved.
