# Office Add-in Server Authentication Sample for NodeJS

[![Build Status](https://travis-ci.org/OfficeDev/Office-Add-in-NodeJS-ServerAuth.svg?branch=master)](https://travis-ci.org/OfficeDev/Office-Add-in-NodeJS-ServerAuth)

A goal of many Office add-in is to improve user productivity, you can get closer to achieve this goal with the help of 3rd party services. Most of today services implement the OAuth 2.0 specification to allow other applications into the user data. Your add-in could be one of these applications.

![Office Add-in Server Authentication Sample screenshot](/readme-images/Office-Add-in-NodeJS-ServerAuth.png)

[//]: # "> **Note:** Link here to Reeza's article."

However, you must keep in mind that Office add-ins run in a variety of platforms and devices. This presents a great opportunity for your add-in, but you must be aware of the following considerations when you try to make OAuth flows work across a combination of platforms and technologies.

## Considerations

Some versions of Office use an iframe to display the add-in. This poses an inconvenience for OAuth flows. The authentication flow in OAuth uses a sign-in page that can't be displayed in an iframe. The reason behind this is to minimize the risk that a malicious page takes control of the sign-in page. Your add-in should not try to display the OAuth sign-in page in the main add-in window.

**Solution:** Start the OAuth flow from a pop-up page.

After the OAuth flow is done, you might want to pass the tokens to your main add-in page and use them to make API calls to the 3rd party service. 
Some browsers, most notably Internet Explorer, have the concept of security zones. If pages are in different security zones, you'll have some difficulty trying to make them talk to each other. This might be the case of your pop-up and main add-in pages.

**Solution:** Store the tokens in a database and make the API calls from your server instead. Enable server-side communication via sockets to communicate the results. There are many libraries that make it easy to communicate between the server and the pages. This sample uses [Socket.io](http://socket.io) to notify the main add-in page that the OAuth flow is done.

Because of the security zones mentioned previously, we can't be sure that the pop-up and the main add-in page share the same session identifier in your add-in. If this is the case, the add-in server doesn't have a way to determine what main add-in page it needs to notify.

**Solution:** Use the main page session identifier to identify the browser session, whether it is the pop-up or the main add-in page. If you have to open a pop-up send the session identifier as part of the path or query string.

The OAuth flow is also affected by security zones. If your add-in can't reliably identify the browser session where the OAuth flow returned you'll have problems deciding to what browser session owns the tokens.

**Solution:** Use the state parameter in the OAuth flow to identify the session that owns the tokens. Further discussion about this technique can be found in [Encoding claims in the OAuth 2 state parameter using a JWT](https://tools.ietf.org/html/draft-bradley-oauth-jwt-encoded-state-04). 

    > Note: The OAuth 2.0 authorization protocol specifies that the authorization server should perform an exact string comparison of the redirect\_uri parameter with the redirect\_uri value registered by the client. For this reason, you shouldn't use query string parameters or additional path elements to the redirect\_uri. 

As an additional security measure, this sample deletes tokens from the database after two minutes. You should implement token storage policies according to your application requirements.

## Prerequisites

To use the Office Add-in Server Authentication sample, you need the following:

* [Node.js](https://nodejs.org/) is required to run the sample. The sample has been tested on Node.js version 4.2.1.
* [CouchDB](https://couchdb.apache.org) version 1.5.1 or greater.
* The dependencies require Python version 2.7.0 and XCode version 6.3.2 or greater (Mac) or Visual Studio Express 2015 with C++ features installed (Windows).
* A Microsoft Azure tenant or Google developer account to register your application. Azure Active Directory (AD) and Google APIs provide identity services that applications use for authentication and authorization. You can use an [Azure trial subscription](https://account.windowsazure.com/SignUp) or a [Google account](https://console.developers.google.com/).
* A [```client ID```](app/Constants.php#L29), and [```secret``](app/Constants.php#L30) values of an application registered in Azure and/or Google.

     > **Note:** <br />
     During the app registration process, make sure to specify **https://localhost:3000/connect/azure/callback** or **https://localhost:3000/connect/google.callback** as the **redirect URL**.

## Configure the add-in

See [Create a network shared folder catalog for task pane and content add-ins](https://msdn.microsoft.com/library/office/fp123503.aspx) to install the add-in to your Office desktop applications or [Publish task pane and content add-ins to an add-in catalog on SharePoint](https://msdn.microsoft.com/library/office/fp123517.aspx) if you want to install the add-in to your organization's add-ins.

## Configure and run the app

1. Using your favorite text editor, open **ws-conf.js**.
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
    
6. Navigate to ```http://localhost:8000``` in your web browser.

## Troubleshooting

### Error: Unable to get local issuer certificate

You receive the following error after providing your credentials to the sign in page.
```
SSL certificate problem: unable to get local issuer certificate
```

cURL can't verify the validity of the Microsoft certificate when trying to issue a request call to get tokens. You must configure cURL to use a certificate when issuing https requests by following these steps:  

1. Download the cacert.pem file from [cURL website](http://curl.haxx.se/docs/caextract.html). 
2. Open your php.ini file and add the following line

	```
	curl.cainfo = "path_to_cacert/cacert.pem"
	```

## Questions and comments

We'd love to get your feedback about the Office 365 PHP Connect sample. You can send your questions and suggestions to us in the [Issues](https://github.com/OfficeDev/O365-PHP-Microsoft-Graph-Connect/issues) section of this repository.

Questions about Office 365 development in general should be posted to [Stack Overflow](http://stackoverflow.com/questions/tagged/Office365+API). Make sure that your questions or comments are tagged with [Office365] and [API].
  
## Additional resources

* [Office 365 APIs platform overview](https://msdn.microsoft.com/office/office365/howto/platform-development-overview)
* [Getting started with Office 365 APIs](http://dev.office.com/getting-started/office365apis)
* [Overview of Microsoft Graph](http://graph.microsoft.io/)
* [Other Microsoft Graph Connect samples](https://github.com/officedev?utf8=%E2%9C%93&query=Microsoft-Graph-Connect)
* [Office 365 APIs starter projects and code samples](https://msdn.microsoft.com/office/office365/howto/starter-projects-and-code-samples)
* [Office UI Fabric](https://github.com/OfficeDev/Office-UI-Fabric)

## Copyright
Copyright (c) 2015 Microsoft. All rights reserved.
