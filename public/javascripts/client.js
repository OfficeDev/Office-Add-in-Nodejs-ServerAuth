/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */
'use strict';

var socket = io.connect('https://localhost:3001', { secure: true });
// The token will only live in our database for 2 minutes
var tokenLifetime = 120000;
var timers = {};

// Respond to the init event - this is for debugging
socket.on('init', function (data) {
    console.log(data);
});

socket.on('auth_success', function (authenticationData) {
    console.log('Auth success: ' + authenticationData.sessionID);
    // Show the 'connected' UI for the authenticated provider
    $('#' + authenticationData.providerName + '_disconnected').css('display', 'none');
    $('#' + authenticationData.providerName + '_connected').css('display', 'block');
    $('#' + authenticationData.providerName + '_name').text('Name: ' + authenticationData.displayName);
    
    // Initiate the disconnect flow when the token lifetime comes to an end.
    timers[authenticationData.providerName] = setTimeout("silentDisconnect('" + authenticationData.sessionID + "', '" + authenticationData.providerName + "')", tokenLifetime);
    
    //Update the Office host
    Office.context.document.setSelectedDataAsync(authenticationData.providerName + ' connected \nUser: ' + authenticationData.displayName);
});

socket.on('disconnect_complete', function (providerName) {
    clearTimeout(timers[providerName]);
    $('#' + providerName + '_disconnected').css('display', 'block');
    $('#' + providerName + '_connected').css('display', 'none');
    Office.context.document.setSelectedDataAsync(providerName + ' disconnected');
});

// The initialize function must be run each time a new page is loaded.
Office.initialize = function (reason) {
    $(document).ready(function () {
    });
};

function silentDisconnect (sessionID, providerName) {
    $.get('/disconnect/' + providerName + '/' + sessionID);
    $('#' + providerName + '_disconnected').css('display', 'block');
    $('#' + providerName + '_connected').css('display', 'none');
}
