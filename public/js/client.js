console.log('Client-side code running');

var socket = io();
let enterPress = false;
let promptState = 0;
let currentPromptType = "";

const commandLine = document.getElementById('commandLine');
commandLine.onkeypress = handleCommand;

function handleCommand(e){
	if(e.code == "Enter"){
		let commandLine = document.getElementById("commandLine");
	    enterPress = true;

	    if(promptState){
	    	closePrompt();
	    	socket.emit('prompt reply', currentPromptType, commandLine.value);
		    commandLine.value = "";
	    }
	    else{
	    	socket.emit('command', commandLine.value);
		    commandLine.value = "";
	    }
	}
}

function openPrompt(){
	document.getElementById('promptContainer').style.animation = "openPrompt .5s 1 forwards";
	document.getElementById('messageLog').style.animation = "openPromptMessageLog .5s 1 forwards";
	promptState = 1;
}

function closePrompt(){
	document.getElementById('promptContainer').style.animation = "closePrompt .5s 1 forwards";
	document.getElementById('messageLog').style.animation = "closePromptMessageLog .5s 1 forwards";
	promptState = 0;
}

function printMessageToLog(msg){
	let isAtBottom = false;
	if(messageLog.scrollTop >= messageLog.scrollHeight - messageLog.clientHeight - 10){
		isAtBottom = true;
	}

	let li = document.createElement("li")

	let regex = /(<br>|<b>|<strong>|<i>|<em>|<del>|<ins>|<sub>|<sup>)/gi;
	let messageMinusCommands = msg.split(regex);
	console.log(msg);
	console.log(messageMinusCommands);

	let finalMsg = "";

	for(let i = 0 ; i < messageMinusCommands.length ; i++){

		if(!/^(<br>|<b>|<strong>|<i>|<em>|<del>|<ins>|<sub>|<sup>)$/gi.test(messageMinusCommands[i])){
			messageMinusCommands[i] = messageMinusCommands[i].replace(/&/g, "&amp;");
			messageMinusCommands[i] = messageMinusCommands[i].replace(/</g, "&lt;");
			messageMinusCommands[i] = messageMinusCommands[i].replace(/>/g, "&gt;");
		}

		finalMsg = finalMsg + messageMinusCommands[i];
	}

	console.log(finalMsg);

	li.innerHTML = finalMsg;
	document.getElementById("messageLog").prepend(li);

	if(enterPress || isAtBottom){
		let messageLog = document.getElementById("messageLog");
		messageLog.scrollTop = messageLog.scrollHeight - messageLog.clientHeight;
		enterPress = false;
	}
}

function createPromptRequest(promptType, message){
	//called when a connection is established with the server
	currentPromptType = promptType;
	document.getElementById('prompt').innerText = message;
	openPrompt();
}

function clientConnected(){
	printMessageToLog("Successfully connected to server!")
	createPromptRequest("accountInitialization", "Login or Register?")
}

socket.on("chat message", printMessageToLog);

socket.on("client connected", clientConnected);

socket.on('prompt request', createPromptRequest);