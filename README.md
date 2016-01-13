# Office Add-in Server Authentication Sample for Node.js

A goal of many Microsoft Office add-ins is to improve user productivity. You can get closer to achieving this goal with the help of third-party services. Most of today's services implement the OAuth 2.0 specification to allow other applications into the user data.

![Office add-in Server Authentication Sample screenshot](/readme-images/Office-add-in-Nodejs-ServerAuth.png)

Keep in mind that Office add-ins run on a variety of platforms and devices, which presents a great opportunity for your add-in. You must be aware, however, of the following considerations when you try to make OAuth flows work across a combination of platforms and technologies.

## Design considerations

Office applications display add-ins within an iframe on browser platforms. Many authentication services refuse to present sign-in pages to an iframe to minimize the risk that a malicious page could interfere. This limits displaying any sign-in page in the main add-in window.

**Solution:** Start the OAuth flow from a pop-up window

After the OAuth flow is done, you might want to pass the tokens to your main add-in page and use them to make API calls to the 3rd party service. 
Some browsers, most notably Internet Explorer, navigate within security boundaries (e.g. Zones). If pages are in different security zones, it’s not possible to pass tokens from the pop-up page to the main page.

**Solution:** Store the tokens in a database and make the API calls from your server instead. Enable server-side communication via sockets to send authentication results to the main page. There are many libraries that make it easy to communicate between the server and the browser. This sample uses [Socket.io](http://socket.io) to notify the main add-in page that the OAuth flow is done.

Because of the security zones mentioned previously, we can't ensure that the pop-up and the main add-in page share the same session identifier in your add-in. If this is the case, the add-in server doesn't have a way to determine what main add-in page it needs to notify.

**Solution:** Use the main page session ID to identify the browser session. If you have to open a pop-up, send the session identifier as part of the path or query string.

Your add-in must reliably identify the browser session that started the OAuth flow. When the flow returns to the configured redirect URI, your add-in needs to decide which browser session owns the tokens. If your add-in pages are in different security zones, the add-in won't be able to assign the tokens to the right browser session.

**Solution:** Use the state parameter in the OAuth flow to identify the session that owns the tokens. Further discussion about this technique can be found in [Encoding claims in the OAuth 2 state parameter using a JWT](https://tools.ietf.org/html/draft-bradley-oauth-jwt-encoded-state-04). Note that the article is a work in progress. 

As an additional security measure, this sample deletes tokens from the database within two minutes of requesting them. You should implement token storage policies according to your application requirements.

## Prerequisites

To use the Office add-in Server Authentication sample, you need the following:

* [Node.js](https://nodejs.org/) is required to run the sample. The sample has been tested on Node.js version 4.2.1.
* [CouchDB](https://couchdb.apache.org) version 1.5.1 or greater.
* Some dependencies require XCode version 6.3 or greater (Mac) or Visual Studio Express 2015 with [Common Tools for Visual C++ 2015](/readme-images/VSC++CommonTools.png) (Windows).
* The sample requires a Bash shell, in Windows you can use Git Bash for Windows or Cygwin. Mac and Linux developers can use their standard terminals.
    * The sample requires OpenSSL to generate a self-signed certificate. The mentioned Bash shells as well as most Mac and Linux Bash shells include a compatible version of OpenSSL.
* A `client ID` and `key` values of an application registered in Azure Management Portal and/or `client ID` and `client secret` values of credentials of a project registered in Google Developers Console.

## Register your app in Azure or Google

The ServerAuth sample supports apps registered in Azure or Google. You can test the sample with either services or both.

### Register your app in Azure

Register a web application in [Azure Management portal](https://manage.windowsazure.com) with the following configuration:

Parameter | Value
---------|--------
Name | ServerAuth sample (optional)
Type | Web application and/or web API
Sign-on URL | https://localhost:3000/connect/azure/callback
App ID URI | https://localhost:3000 (optional)

Once you register your application, take note of the *client ID* and *client secret* values.

Note that the default permissions are enough for this sample. For more information on how to register your app, see [Register your web server app with the Azure Management Portal](https://msdn.microsoft.com/office/office365/HowTo/add-common-consent-manually#bk_RegisterServerApp).

### Register your app in Google

Register a web application in [Google Developers Console](https://console.developers.google.com) with the following configuration:

Parameter | Value
---------|--------
Project name | ServerAuth sample (optional)
Credentials | OAuth client ID
Application type | Web application
Authorized redirect URIs | https://localhost:3000/connect/google/callback

Once you register your application, take note of the *client ID* and *client secret* values.

Note that the default permissions are enough for this sample. For more information on how to register your app, see [Developers Console Help](https://developers.google.com/console/help/new/).

## Configure and run the web app

1. Use a text editor to open ```ws-conf.js```.
2. Replace *ENTER_YOUR_CLIENT_ID* with the client ID of your registered Azure or Google application.
3. Replace *ENTER_YOUR_SECRET* with the client secret of your registered Azure or Google application.
4. Generate a self-signed certificate using the included script: [`ss_certgen.sh`](/ss_certgen.sh).

    To run the script, run the following command in your terminal:
    
    On Linux, Mac and Git Bash for Windows
    ```
    $ bash ss_certgen.sh
    ```
    On Cygwin for Windows
    ```
    $ bash -o igncr ss_certgen.sh
    ```

   After running the script, two files will be created in the project root:
   ```
   server.crt // the certificate
   ```
   
   ```
   server.key // the keyfile
   ```
   
   > **Note:** <br />
   `server.crt` and `server.key` must be present in the project root - they will be picked up automatically at runtime. To use an alternate path see [`certconf.js`](/certconf.js).

5. Install the dependencies running the following command:

    On Linux/Mac
    ```
    npm install
    ```
    On Windows
    ```
    npm install --msvs_version=2015
    ```

6. Make sure that your CouchDB server is running. Go to [Futon](http://localhost:5984/_utils) in your local server and verify that the page loads correctly. To start CouchDB use the `CouchDB` script located in the *bin* folder in your CouchDB installation.
7. Start the application with the following command:
    ```
    npm start
    ```
    
    > **Note:** <br />
    You must trust the self-signed certificate so it can display properly in Office. See, [Trust your self-signed certificate](https://github.com/OfficeDev/Office-add-in-Nodejs-ServerAuth/wiki/Trust-your-self-signed-certificate) for instructions.
    
8. Open Microsoft Word or Microsft Excel and click **Insert** > **My add-ins** > **See all**
9. Choose **Shared Folder** if you deployed the add-in to a network share, or **My Organization** if you deployed the add-in to the add-in catalog.
10. Select **ServerAuth Sample**.

## Deploy the add-in

To make the add-in available in your Office client, you must deploy the manifest to a folder share. If you want to use the add-in in Word or Excel Online you must deploy the manifest to the add-in catalog.

### To deploy the manifest to a folder share

1. Create a folder on a network share, for example \\MyShare\MyManifests.
2. Copy the manifest files from the root folder of this sample and paste to the network share.
3. Open a new document in Excel or Word.
4. Choose the File tab, and then choose Options.
5. Choose Trust Center, and then choose the Trust Center Settings button.
6. Choose Trusted Add-in Catalogs.
7. In the Catalog Url box, enter the path to the network share you created in Step 1, and then choose Add Catalog.
8. Select the Show in Menu check box, and then choose OK.

For a detailed explanation of the previous process, see [Create a network shared folder catalog for task pane and content add-ins](https://msdn.microsoft.com/library/office/fp123503.aspx).

### To deploy the manifest to the add-in catalog

1. Browse to the add-in catalog.
2. Choose **Apps for Office** from the left navigation bar.
3. Choose **Upload**, and then **Choose files** to browse to the *manifest.xml* file in the root folder of this sample.
4. Choose **OK**.

For a detailed explanation of the previous process, see [Publish task pane and content add-ins to an add-in catalog on SharePoint](https://msdn.microsoft.com/library/office/fp123517.aspx).

## Open the add-in in Word or Excel

You can try the ServerAuth sample in Word or Excel desktop clients if you deployed the manifest to a network share or in Word or Excel Online if you deployed the manifest to the add-in catalog.

To open the add-in:

1. Open Word or Excel.
2. Choose **My Add-ins** on the **Insert** tab.
3. Choose **Shared Folder** if you deployed the manifest to a network share or **My Organization** if you deployed the manifest to the add-in catalog.
4. Choose **ServerAuth sample**.

## Credits

This code sample is based on ideas originally published in a [blog post](http://blogs.msdn.com/b/richard_dizeregas_blog/archive/2015/08/10/connecting-to-office-365-from-an-office-add-in.aspx) by Richard diZerega. Richard is an evangelist at Microsoft who works with Office 365 developers.

## Questions and comments

We'd love to get your feedback about this sample. You can send your questions and suggestions to us in the [Issues](https://github.com/OfficeDev/Office-add-in-Nodejs-ServerAuth/issues) section of this repository.

Questions about Office 365 development in general should be posted to [Stack Overflow](http://stackoverflow.com/questions/tagged/office-addins). Make sure that your questions or comments are tagged with [office-addins].
  
## Additional resources

* [More add-in samples](https://github.com/OfficeDev?utf8=%E2%9C%93&query=-add-in)
* [Office add-ins](http://msdn.microsoft.com/library/office/jj220060.aspx)
* [Anatomy of an add-in](https://msdn.microsoft.com/library/office/jj220082.aspx#StartBuildingApps_AnatomyofApp)

## Copyright
Copyright (c) 2015 Microsoft. All rights reserved.
