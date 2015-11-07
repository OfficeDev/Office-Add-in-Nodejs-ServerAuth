var socket = io.connect('https://localhost:3001', { secure: true });
console.log(document.cookie);

// respond to the init event - this is for debugging
socket.on('init', function (data) {
	console.log(data);
});

socket.on('auth_success', function (data) {
	console.log(JSON.stringify(data));
	// obviously this shouldn't *actually* work this way,
	// but I didn't want to totally break the UI updating
	if (data.providers[0].providerName === 'azure') {
		$('#azure_disconnected').css('display', 'none');
		$('#azure_connected').css('display', 'block');
	}
});