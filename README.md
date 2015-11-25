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

Because of the security zones mentioned previously, we can't be completely sure that the pop-up and the main add-in page share the same session identifier in your add-in. If this is the case, the add-in server doesn't have a way to determine what main add-in page it needs to notify.

**Solution:** Use the main page session identifier to identify the browser session, whether it is the pop-up or the main add-in page. If you have to open a pop-up send the session identifier as part of the path or query string.

The OAuth flow is also affected by the security zones. If your add-in can't reliably identify the browser session where the OAuth flow returned you'll have problems deciding to what browser session owns the tokens.

**Solution:** Use the state parameter in the OAuth flow to identify the session that owns the tokens. Further discussion about this technique can be found in [Encoding claims in the OAuth 2 state parameter using a JWT](https://tools.ietf.org/html/draft-bradley-oauth-jwt-encoded-state-04). 

    > Note: The OAuth 2.0 authorization protocol specifies that the authorization server should perform an exact string comparison of the redirect\_uri parameter with the redirect\_uri value registered by the client. For this reason, you shouldn't use query string parameters or additional path elements to the redirect\_uri. 

## Prerequisites

To use the Office Add-in Server Authentication sample, you need the following:

* [PHP](http://php.net/) is required to run the sample on a development server. The instructions in this sample use the PHP 5.4 built-in web server. However, the sample has also been tested on Internet Information Services and Apache Server.
	* Client URL (cURL) module. The web application uses cURL to issue requests to REST endpoints. 
* An Office 365 account. You can sign up for [an Office 365 Developer subscription](https://portal.office.com/Signup/Signup.aspx?OfferId=6881A1CB-F4EB-4db3-9F18-388898DAF510&DL=DEVELOPERPACK&ali=1#0) that includes the resources that you need to start building Office 365 apps.

     > **Note:** <br />
     If you already have a subscription, the previous link sends you to a page with the message *Sorry, you can’t add that to your current account*. In that case use an account from your current Office 365 subscription.<br /><br />
     If you are already signed-in to Office 365, the Sign-in button in the previous link shows the message *Sorry, we can't process your request*. In that case sign-out from Office 365 in that same page and sign-in again.
* A Microsoft Azure tenant to register your application. Azure Active Directory (AD) provides identity services that applications use for authentication and authorization. A trial subscription can be acquired here: [Microsoft Azure](https://account.windowsazure.com/SignUp).

     > **Important:** <br />
     You also need to make sure your Azure subscription is bound to your Office 365 tenant. To do this, see the Active Directory team's blog post, [Creating and Managing Multiple Windows Azure Active Directories](http://blogs.technet.com/b/ad/archive/2013/11/08/creating-and-managing-multiple-windows-azure-active-directories.aspx). The section **Adding a new directory** will explain how to do this. You can also see [Set up your Office 365 development environment](https://msdn.microsoft.com/office/office365/howto/setup-development-environment#bk_CreateAzureSubscription) and the section **Associate your Office 365 account with Azure AD to create and manage apps** for more information.
* A [```client ID```](app/Constants.php#L29), and [```key```](app/Constants.php#L30) values of an application registered in Azure. This sample application must be granted the **Send mail as a user** permission for the **Microsoft Graph**. For details see [Register your web server app with the Azure Management Portal](https://msdn.microsoft.com/office/office365/HowTo/add-common-consent-manually#bk_RegisterServerApp) and [grant proper permissions to the Connect application](https://github.com/OfficeDev/O365-PHP-Microsoft-Graph-Connect/wiki/Grant-permissions-to-the-Connect-application-in-Azure).

     > **Note:** <br />
     During the app registration process, make sure to specify **http://localhost:8000/callback.php** as the **Sign-on URL**.

## Configure and run the app

1. Map a web application in your web server to the **app** folder in your local repository. 
2. Using your favorite IDE, open **Constants.php** in the *app* folder.
3. Replace *ENTER_YOUR_CLIENT_ID* with the client ID of your registered Azure application.
4. Replace *ENTER_YOUR_SECRET* with the client secret of your registered Azure application.
5. Start the built-in web server with the following command:
    ```
    php -S 0.0.0.0:8000 -t app
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
