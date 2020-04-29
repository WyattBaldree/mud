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
		case "loginUsername":
			loginUsername(io, socket, promptType, promptReply);
			break;
		case "loginPassword":
			loginPassword(io, socket, promptType, promptReply);
		case "characterInitialization":
			characterInitialization(io, socket, promptType, promptReply);
			break;
		default:
			console.log("Prompt type, " + promptType + ", not recognized.");
			break;	
	}
}

function regAccount(io, socket, promptType, promptReply){
	switch(promptReply.toLowerCase()){
		case "login":
			socket.temp = {
				username: "",
				password: ""
			};
			socket.emit('chat message', 'Login started.');
			socket.emit('prompt request', 'loginUsername', "Enter your username: ");
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
		socket.emit('chat message', 'Username must be at least 3 characters long.');
		socket.emit('chat message', 'Username must be at most 20 characters long.');
		socket.emit('chat message', 'Username must contain none of the following: ~`!@#$%^&*+=-[]\';,\\/{}|\":<>?()._');
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

function loginUsername(io, socket, promptType, promptReply){
	if(!isUsernameValid(promptReply)){
		socket.emit('chat message', 'Username must be at least 3 characters long.');
		socket.emit('chat message', 'Username must be at most 20 characters long.');
		socket.emit('chat message', 'Username must contain none of the following: ~`!@#$%^&*+=-[]\';,\\/{}|\":<>?()._');
		socket.emit('prompt request', 'loginUsername', "Enter your username: ");
	}
	else{
		exports.mySqlModule.select("*", "users", "username = '" + promptReply + "'", loginUsernameCallback, promptReply, socket);
	}
}

function loginUsernameCallback(result, username, socket){
	if(result.length > 0){ //if promptReply is a valid username
		socket.temp.username = username;
		socket.emit('chat message', 'Username, '+ username + ', accepted.');
		socket.emit('prompt request', 'loginPassword', "Enter your password: ");
	}else{
		socket.emit('chat message', "Username does not exist.")
		socket.emit('prompt request', 'loginUsername', "Enter your username: ");
	}
}

function loginPassword(io, socket, promptType, promptReply){

	let where = "username = '" + socket.temp.username + "' AND password = '" + promptReply +"'";
	exports.mySqlModule.select("*", "users", where, loginPasswordCallback, promptReply, socket);
	
}

function loginPasswordCallback(result, password, socket){
	if(result.length > 0){ //if the account exists.
		socket.temp.password = password;
		socket.userId = result[0].id;
		socket.username = socket.temp.username;



		socket.emit('chat message', 'Password accepted.');
		socket.emit('chat message', "Welcome, " + socket.username + ".");
		socket.emit('chat message', "Your Characters:");
		socket.emit('chat message', "Welcome, " + socket.username + ".");
		socket.emit('chat message', "Welcome, " + socket.username + ".");
		socket.emit('prompt request', 'characterInitialization', "Which you like to load? (1, 2, 3)");
	}else{
		socket.emit('chat message', "Wrong Password.")
		socket.emit('prompt request', 'loginUsername', "Enter your username: ");
	}
}

function characterSelectScreen(socket){

	exports.mySqlModule.select("*", "users", "id = '" + socket.userId + "'", function(result){
		let characterIds = result[0].characters.split(",");
		socket.emit('chat message', "Your Characters:");
		socket.emit('chat message', "Welcome, " + socket.username + ".");
		socket.emit('chat message', "Welcome, " + socket.username + ".");
		socket.emit('chat message', "Welcome, " + socket.username + ".");
		socket.emit('prompt request', 'characterInitialization', "Which you like to load? (1, 2, 3)");
	});


	socket.emit('chat message', "Your Characters:");
	socket.emit('chat message', "Welcome, " + socket.username + ".");
	socket.emit('chat message', "Welcome, " + socket.username + ".");
	socket.emit('chat message', "Welcome, " + socket.username + ".");
	socket.emit('prompt request', 'characterInitialization', "Which you like to load? (1, 2, 3)");
}

function characterInitialization(io, socket, promptType, promptReply){

}