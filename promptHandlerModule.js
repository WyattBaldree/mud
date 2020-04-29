exports.handlePromptReply = function(io, socket, promptType, promptReply){
	switch(promptType){
		case "accountInitialization":
			regAccount(io, socket, promptType, promptReply);
			break;
		case "regUsername":	
			regUsername(io, socket, promptType, promptReply);
			break;
		case "regPassword":
			regPassword(io, socket, promptType, promptReply);
			break;
		default:
			console.log("Prompt type, " + promptType + ", not recognized.");
			break;	
	}
}

function regAccount(io, socket, promptType, promptReply){
	switch(promptReply.toLowerCase()){
		case "login":
			break;
		case "r":
		case "register":
			socket.temp = {
				username: "",
				password: ""
				};
			socket.emit('chat message', 'Registration started.');
			socket.emit('prompt request', 'regUsername', "Register your username: ");
			break;
		default:
			socket.emit('chat message', 'Invalid choice. Try typing register or login.');
			socket.emit('prompt request', "accountInitialization", "Login or Register?");
	}
}

function regUsername(io, socket, promptType, promptReply){
	if(!isUsernameValid(promptReply)){
		socket.emit('chat message', 'Username must be shorter than 20 characters and contain none of the following: ~`!@#$%^&*+=-[]\';,\\/{}|\":<>?()._');
		socket.emit('prompt request', 'regUsername', "Register your username: ");
	}
	else{
		exports.mySqlModule.select("*", "users", "username = '" + promptReply + "'", regUsernameCallback, promptReply, socket);
	}
}

function regUsernameCallback(result, username, socket){
	if(result.length <= 0){ //if promptReply is a valid username
		socket.temp.username = username;
		socket.emit('chat message', 'Username, '+ username + ', accepted.');
		socket.emit('prompt request', 'regPassword', "Register your password: ");
	}else{
		socket.emit('chat message', "Username taken.")
		socket.emit('prompt request', 'regUsername', "Register your username: ");
	}
}

function isUsernameValid(username){
	return !/[\s~`!@#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?()\._]/g.test(username) && username.length < 20;
}

function regPassword(io, socket, promptType, promptReply){
	if(true){ //if promptReply is a valid password
		socket.temp.password = promptReply;
		exports.mySqlModule.insert("users", "username, password", socket.temp.username, socket.temp.password);
		socket.emit('chat message', 'Password accepted.');
		socket.emit('chat message', "Account successfully created.")
		socket.emit('prompt request', 'accountInitialization', "Login or Register?");
	}else{
		socket.emit('chat message', "Invalid Password")
		socket.emit('prompt request', 'regPassword', "Register your password: ");
	}
}