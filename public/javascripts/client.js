var socket = io.connect('https://serverauthnode.cloudapp.net:3001', { secure: true });
console.log(document.cookie);

// respond to the init event - this is for debugging
socket.on('init', function (data) {
	console.log(data);
});

socket.on('auth_success', function (providers) {
	console.log('auth_success: ' + JSON.stringify(providers));
	// Show the 'connected' UI for the providers
	// that the user has signed-in.
	for (var ii = 0; ii < providers.length; ii++) {
		var providerName = providers[ii].providerName;
		var name = providers[ii].displayName;
		$('#' + providerName + '_disconnected').css('display', 'none');
		$('#' + providerName + '_connected').css('display', 'block');
		$('#' + providerName + '_name').text('Name: ' + name);
		setSelection(providerName + ' connected \nUser: ' + name);
	}
});

socket.on('disconnect_complete', function (providers) {
	console.log('disconnect_complete: ' + JSON.stringify(providers));
	// Show the 'disconnected' UI for the providers
	// that the user has signed-in.
	for (var ii = 0; ii < providers.length; ii++) {
		var providerName = providers[ii].providerName;
		$('#' + providerName + '_disconnected').css('display', 'block');
		$('#' + providerName + '_connected').css('display', 'none');
		setSelection(providerName + ' disconnected');
	}
});

(function () {
    "use strict";

    // The initialize function must be run each time a new page is loaded
    Office.initialize = function (reason) {
        $(document).ready(function () {
            //app.initialize();
        });
    };
})();

// Writes data to the current document selection
function setSelection(data) {
	Office.context.document.setSelectedDataAsync(data);
}