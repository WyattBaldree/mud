console.log('Client-side code running');

var socket = io();
let enterPress = false;

function handleCommand(e){
	if(e.code == "Enter"){
		let commandLine = document.getElementById("commandLine");
	    socket.emit('command', commandLine.value);
	    commandLine.value = "";
	    enterPress = true;
	}
}

function getUsername(){
	return "banjo";
}

function getPassword(){
	return "password";
}

const commandLine = document.getElementById('commandLine');
commandLine.onkeypress = handleCommand;

socket.on("chat message", function(msg){
	let isAtBottom = false;
	if(messageLog.scrollTop >= messageLog.scrollHeight - messageLog.clientHeight - 10){
		isAtBottom = true;
	}

	let li = document.createElement("li")
	li.append(msg);
	document.getElementById("messageLog").prepend(li);

	if(enterPress || isAtBottom){
		let messageLog = document.getElementById("messageLog");
		messageLog.scrollTop = messageLog.scrollHeight - messageLog.clientHeight;
		enterPress = false;
	}
});

socket.on("client connected", function(){
	//called when a connection is established with the server
	let username = "";
	while(username == ""){
		username = prompt("Enter your username:");
	}
	socket.emit("usernameEntered", username);
	console.log(username);
});