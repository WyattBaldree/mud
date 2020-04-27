console.log('Client-side code running');

var socket = io();

function handleCommand(e){
	if(e.code == "Enter"){
		let commandLine = document.getElementById("commandLine");
	    socket.emit('command', commandLine.value);
	    commandLine.value = "";
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
	let li = document.createElement("li")
	li.append(msg);
	document.getElementById("messageLog").append(li);
});