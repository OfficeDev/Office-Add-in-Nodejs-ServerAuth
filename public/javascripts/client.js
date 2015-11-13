var socket = io.connect('https://localhost:3001', { secure: true });
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
	}
});