var socket = io.connect('https://localhost:3001', { secure: true });
console.log(document.cookie);

// respond to the init event - this is for debugging
socket.on('init', function (data) {
	console.log(data);
});

socket.on('auth_success', function (data) {
	console.log(JSON.stringify(data));
	if (data.provider === 'azure') {
		$('#azure_disconnected').css('display', 'none');
		$('#azure_connected').css('display', 'block');
	}
});