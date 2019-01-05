# Office Add-in Server Authentication Sample for Node.js
[![Build Status](https://travis-ci.org/OfficeDev/Office-Add-in-Nodejs-ServerAuth.svg)](https://travis-ci.org/OfficeDev/Office-Add-in-Nodejs-ServerAuth)


 > <span style="color:red">**Important**: This repo is no longer maintained. Due to outdated library dependencies and changes in Azure/Google authorization and permission-granting, it may no longer work "as is". In addition, it suffers from some security vulnerabilities including echoing unencoded/unsanitized data to the page, improper validation of the request forgery token, lack of protection against SQL injection, and dependencies on libraries with security vulnerabilities.</span>

A goal of many Microsoft Office add-ins is to improve user productivity. You can get closer to achieving this goal with the help of third-party services. Most of today's services implement the OAuth 2.0 specification to allow other applications into the user data.

![Office Add-in Server Authentication Sample screenshot](/readme-images/Office-Add-in-Nodejs-ServerAuth.png)

Keep in mind that Office add-ins run on a variety of platforms and devices, which presents a great opportunity for your add-in. You must be aware, however, of [design considerations](https://github.com/OfficeDev/Office-Add-in-Nodejs-ServerAuth/wiki/Office-add-in-design-considerations-when-using-OAuth-2.0-services) when you try to make OAuth flows work across a combination of platforms and technologies.

## Prerequisites

To use the Office add-in Server Authentication sample, you need the following:

* [Node.js](https://nodejs.org/) is required to run the sample. The sample has been tested on Node.js version 4.2.1.
* The sample requires a Bash shell, in Windows you can use [Git Bash for Windows](https://git-for-windows.github.io/) or Cygwin. Mac and Linux developers can use their standard terminals.
    * The sample requires OpenSSL to generate a self-signed certificate. The mentioned Bash shells as well as most Mac and Linux Bash shells include a compatible version of OpenSSL.
* `Client ID` and `key` values of an application registered in Azure Management Portal and/or `client ID` and `client secret` values of credentials of a project registered in Google Developers Console.

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

The sample requires at least one enabled API to work. We tested this sample with the Google+ API enabled. For more information on how to register your app, see [Developers Console Help](https://developers.google.com/console/help/new/).

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
    > **Note:** <br />
    Some OpenSSL installations on Windows throw the following error `Unable to load config info from /usr/local/ssl/openssl.cnf`. To specify the correct path, run the following command instead:
    ```
    $ OPENSSL_CONF='C:\Program Files (x86)\Git\ssl\openssl.cnf' bash ss_certgen.sh
    ```

   After running the script, two files will be created in the project root:
   ```
   server.crt // the certificate
   ```
   
   ```
   server.key // the key file
   ```
   
   > **Note:** <br />
   The `server.crt` and `server.key` files must be present in the project root - they will be picked up automatically at runtime. To use an alternate path see [`certconf.js`](/certconf.js).

5. Install the dependencies running the following command:
    ```
    npm install
    ```

6. Start the application with the following command:
    ```
    npm start
    ```
    
    > **Note:** <br />
    You must trust the self-signed certificate so it can display properly in Office. See, [Trust your self-signed certificate](https://github.com/OfficeDev/Office-add-in-Nodejs-ServerAuth/wiki/Trust-your-self-signed-certificate) for instructions.
    

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
4. Choose **ServerAuth sample** and click **Add**. A new **Server Auth** group will appear on the **Home** tab of the ribbon. 
5. Click the **Open** button in the **Server Auth** group. 

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


This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information, see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
