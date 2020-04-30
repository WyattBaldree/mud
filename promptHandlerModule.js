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
		case "l":
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
	return !/[\s~`!@#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?()\._]/g.test(username) && username.length < 20 && username.length >=3;
}

function isPasswordValid(password){
	let passwordRequire = new RegExp('((?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\\W_]).{6,})'); //Password requires at least 1 lower case character, 1 upper case character, 1 number, 1 special character and must be at least 6 characters and at most 18
	if(password.match(passwordRequire) && password.length <=18){
		return true;
	}
}

function regPassword(io, socket, promptType, promptReply){
	if(isPasswordValid(promptReply)){ //if promptReply is a valid password
		socket.temp.password = promptReply;
		exports.mySqlModule.insert("users", "username, password", socket.temp.username, socket.temp.password);
		socket.emit('chat message', 'Password accepted.');
		socket.emit('chat message', "Account successfully created.")
		socket.emit('prompt request', 'accountInitialization', "Login or Register?");
	}else{
		socket.emit('chat message', "Password Invalid");
		socket.emit('chat message', "Password requires at least 1 lower case character and 1 upper case character.");
		socket.emit('chat message', "Password requires at least 1 number and 1 special character.");
		socket.emit('chat message', "Password must be at least 6 characters long and at most 18 characters long.");
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
		characterSelectScreen(socket);
	}else{
		socket.emit('chat message', "Wrong Password.")
		socket.emit('prompt request', 'loginUsername', "Enter your username: ");
	}
}

function characterSelectScreen(socket){

	exports.mySqlModule.select("*", "users", "id = '" + socket.userId + "'", function(result){

		let characterIds = result[0].characters.split(",");

		exports.mySqlModule.select("*", "characters", "", function(result){
			let charactersInfo = "Your characters: ";
			for(let i = 0 ; i < characterIds.length ; i++){
				if(characterIds[i] == -1){
					charactersInfo = charactersInfo + "<br>" + (i+1) + ") ------------- NEW CHARACTER -------------"
					
				}else{
					let character = result.find(element => element.id == characterIds[i]);
					charactersInfo = charactersInfo + "<br>" + (i+1) + ") Name: " + character.name + " Class: " + character.class;
				}
			}
			socket.emit('chat message', charactersInfo);
			socket.emit('prompt request', 'characterInitialization', "Which you like to load? (1, 2, 3)");
		});
	});
}

function characterInitialization(io, socket, promptType, promptReply){
	exports.mySqlModule.select("*", "users", "id = '" + socket.userId + "'", function(result){
		let characterIds = result[0].characters.split(",");
		let targetCharacterId = characterIds[promptReply];
		if(targetCharacterId == -1){
			//character creation
			socket.emit('chat message', "Character creation started.");
		}else{
			//load character
			socket.emit('chat message', "Loading character.");
		}
	});
}