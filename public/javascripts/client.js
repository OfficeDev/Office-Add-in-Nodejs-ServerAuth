/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */
'use strict';

var socket = io.connect('https://localhost:3001', { secure: true });
// The token will only live in our database for 2 minutes
var tokenLifetime = 120000;
var timers = {};

socket.on('auth_success', function onAuthSuccess(authenticationData) {
  // Show the 'connected' UI for the authenticated provider
  $('#' + authenticationData.providerName + '_disconnected').css('display', 'none');
  $('#' + authenticationData.providerName + '_connected').css('display', 'block');
  $('#' + authenticationData.providerName + '_name').text('Name: ' + authenticationData.displayName);

  // Initiate the disconnect flow when the token lifetime comes to an end.
  timers[authenticationData.providerName] =
    setTimeout(
      function () {
        return "silentDisconnect('" +
          authenticationData.sessionID +
          "', '" +
          authenticationData.providerName +
          "')";
      },
      tokenLifetime
    );

  // Update the Office host
  Office.context.document.setSelectedDataAsync(
    authenticationData.providerName + ' connected \n' +
    'User: ' + authenticationData.displayName
  );
});

socket.on('disconnect_complete', function onDisconnectComplete(providerName) {
  clearTimeout(timers[providerName]);
  $('#' + providerName + '_disconnected').css('display', 'block');
  $('#' + providerName + '_connected').css('display', 'none');
  Office.context.document.setSelectedDataAsync(providerName + ' disconnected');
});

// The initialize function must be run each time a new page is loaded.
Office.initialize = function officeInitialize(reason) {
  $(document).ready(function officeReady() {});
};

function silentDisconnect(sessionID, providerName) {
  window.open(
    'https://localhost:3000/disconnect/' + providerName + '/' + sessionID,
    'AuthPopup',
    'width=500,height=500,centerscreen=1,menubar=0,toolbar=0,location=0,personalbar=0,status=0,titlebar=0,dialog=1'
  );
}
