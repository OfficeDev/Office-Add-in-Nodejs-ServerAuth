var socket = io.connect('https://localhost:3001', { secure: true });
console.log(document.cookie);

// respond to the init event - this is for debugging
socket.on('init', function (data) {
	console.log(data);
});

socket.on('auth_success', function (data) {
	console.log(data.provider + ' token: ' + data.code.substring(0, 10) + "...[truncated]");
	if (data.provider === 'Azure') {
		$('#azure_disconnected').css('display', 'none');
		$('#azure_connected').css('display', 'block');
	}
});