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

socket.on('auth_success', function (userData) {
    // The server only sent data for the provider that just got updated.
    var provider = userData.providers[0];
    // Show the 'connected' UI for the authenticated provider
    $('#' + provider.providerName + '_disconnected').css('display', 'none');
    $('#' + provider.providerName + '_connected').css('display', 'block');
    $('#' + provider.providerName + '_name').text('Name: ' + provider.displayName);
    
    // Initiate the disconnect flow when the token lifetime comes to an end.
    timers[provider.providerName] = setTimeout("silentDisconnect('" + userData.sessionID + "', '" + provider.providerName + "')", tokenLifetime);
    
    //Update the Office host
    Office.context.document.setSelectedDataAsync(provider.providerName + ' connected \nUser: ' + provider.displayName);
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
