console.log('Client-side code running');

var socket = io();
let enterPress = false;
let promptState = 0;
let currentPromptType = "";
let currentExitType = "";
let saved10messages = ["","","","","","","","","",""];
let currentMessageIndex = 10;

const commandLine = document.getElementById('commandLine');
commandLine.onkeydown = handleCommand;

function handleCommand(e){
	if(e.code == "Enter"){
		let commandLine = document.getElementById("commandLine");
	    enterPress = true;
	    currentMessageIndex = 10;
	    if(commandLine.value != ""){
	    	saved10messages.shift();
	   		saved10messages.push(commandLine.value);
	    console.log(saved10messages);
	    }

	    
	    if(promptState){
	    	closePrompt();
	    	socket.emit('prompt reply', currentPromptType, commandLine.value, currentExitType);
		    commandLine.value = "";
	    }
	    else{
	    	socket.emit('command', commandLine.value);
		    commandLine.value = "";
	    }
	}
	else if(e.code == "ArrowUp"){
		console.log(saved10messages);
		if(currentMessageIndex > 0 && saved10messages[currentMessageIndex-1] != ""){
			currentMessageIndex--;
		}
		console.log("currentmessage index: " + currentMessageIndex);
		commandLine.value = saved10messages[currentMessageIndex];
	}
	else if(e.code == "ArrowDown"){
		console.log(saved10messages);
		if(currentMessageIndex < 9){
			currentMessageIndex++;
		}
		console.log("currentmessage index: " + currentMessageIndex);
		commandLine.value = saved10messages[currentMessageIndex];
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
//(?:red|blue|green|yellow|white|orange|purple)
	let regex = /(<\/?br>|<\/?b>|<\/?strong>|<\/?i>|<\/?em>|<\/?del>|<\/?ins>|<\/?sub>|<\/?sup>|<color:(?:red|blue|green|yellow|white|orange|purple)>|<\/color>)/gi;
	let messageMinusCommands = msg.split(regex);
	console.log(msg);
	console.log(messageMinusCommands);

	let finalMsg = "";

	for(let i = 0 ; i < messageMinusCommands.length ; i++){
		if(/^<color:(?:red|blue|green|yellow|white|orange|purple)>$/gi.test(messageMinusCommands[i])){
			let color = messageMinusCommands[i].substring(messageMinusCommands[i].indexOf(':') + 1, messageMinusCommands[i].indexOf('>'));
			console.log(color);
			messageMinusCommands[i] = '<span  style="color: ' + color + ';">';
		}
		else if(/<\/color>/gi.test(messageMinusCommands[i])){
			 messageMinusCommands[i] = "</span>";
		}
		else if(!/^(<\/?br>|<\/?b>|<\/?strong>|<\/?i>|<\/?em>|<\/?del>|<\/?ins>|<\/?sub>|<\/?sup>)$/gi.test(messageMinusCommands[i])){
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

function createPromptRequest(promptType, message, exitType){
	//called when a connection is established with the server
	currentPromptType = promptType;
	currentExitType = exitType;
	document.getElementById('prompt').innerText = message;
	openPrompt();
}

function clientConnected(){
	printMessageToLog("Successfully connected to server!")
	createPromptRequest("accountInitialization", "Login or Register?", "accountInitialization");
}

socket.on("chat message", printMessageToLog);

socket.on("client connected", clientConnected);

socket.on('prompt request', createPromptRequest);