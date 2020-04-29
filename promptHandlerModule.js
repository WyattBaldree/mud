exports.handlePromptReply = function(io, socket, promptType, promptReply){
	switch(promptType){
		case "username":
			socket.username = promptReply;
			if(socket.username){
  				io.emit('chat message', socket.username + " has connected");
 			}
			break;
		case "accountInitialization":
			switch(promptReply.toLowerCase()){
				case "login":
				case "register":
					socket.temp = {
						username: "",
						password: ""
						};
					socket.emit('prompt request', 'regUsername', "Register your username: ");
					break;
				default: 
			}
			break;
		case "regUsername":	
			exports.mySqlModule.checkUsername(promptReply, socket, regUsername);
			break;
		case "regPassword":
			if(true){ //if promptReply is a valid password
				socket.temp.password = promptReply;
				exports.mySqlModule.registerAccount(socket.temp.username, socket.temp.password);
			}else{
				socket.emit('chat message', "Invalid Password")
				socket.emit('prompt request', 'regPassword', "Register your password: ");
			}
			break;
		default:
			console.log("Prompt type, " + promptType + ", not recognized.");
			break;	
	}
}



function regUsername(valid, username, socket){
	if(valid){ //if promptReply is a valid username
		socket.temp.username = username;
		socket.emit('prompt request', 'regPassword', "Register your password: ");
	}else{
		socket.emit('chat message', "Invalid Username")
		socket.emit('prompt request', 'regUsername', "Register your username: ");
	}
}