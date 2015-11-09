var socket = io.connect('https://localhost:3001', { secure: true });
console.log(document.cookie);

// respond to the init event - this is for debugging
socket.on('init', function (data) {
	console.log(data);
});

socket.on('auth_success', function (data) {
	console.log('auth_success: ' + JSON.stringify(data));
	// Show the 'connected' UI for the providers
	// that the user has signed-in.
	var provider;
	for (var i = 0; i < data.providers.length; i++)  {
		var providerName = data.providers[i].providerName;
		var name = data.providers[i].name;
		$('#' + providerName + '_disconnected').css('display', 'none');
		$('#' + providerName + '_connected').css('display', 'block');
		$('#' + providerName + '_name').text('Name: ' + name);
	}
});