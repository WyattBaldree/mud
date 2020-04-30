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
			break;
		case "characterInitialization":
			characterInitialization(io, socket, promptType, promptReply);
			break;
		case "characterCreationFirstName":
			characterCreationFirstName(io, socket, promptType, promptReply);
			break;
		case "characterCreationLastName":
			characterCreationLastName(io, socket, promptType, promptReply);
			break;
		case "characterCreationRace":
			characterCreationRace(io, socket, promptType, promptReply);
			break;
		case "characterCreationClass":
			characterCreationClass(io, socket, promptType, promptReply);
			break;
		case "confirm":
			confirm(io, socket, promptType, promptReply);
			break;
		default:
			console.log("Prompt type, " + promptType + ", not recognized.");
			break;	
	}
}

function regAccount(io, socket, promptType, promptReply){
	switch(promptReply.toLowerCase()){
		case "d":
		case "debug":
			//automatically log in as a debug character.
			login(socket, 0);
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
		socket.emit('chat message', "Username Invalid. Username requires:<br>" + 
									">at least 3 characters<br>" +
									">no more than 16 characters<br>" +
									">none of the following: ~`!@#$%^&*+=-[]\';,\\/{}|\":<>?()._" 
					);
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
	return !/[\s~`!@#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?()\._]/g.test(username) && username.length < 16 && username.length >=3;
}

function isPasswordValid(password){
	//Password requires at least 1 lower case character, 1 upper case character, 1 number, 1 special character and must be at least 6 characters and at most 18
	let passwordRequire = new RegExp('((?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\\W_]).{6,})'); 
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
		socket.emit('chat message', "Password Invalid. Password requires:<br>" + 
									">at least 1 lower case character<br>" +
									">at least 1 upper case character<br>" +
									">at least 6 characters<br>" +
									">no more than 18 characters"
					);
		socket.emit('prompt request', 'regPassword', "Register your password: ");
	}
}

function loginUsername(io, socket, promptType, promptReply){
	if(!isUsernameValid(promptReply)){
		socket.emit('chat message', "Username Invalid.");
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
		login(socket, result[0].id);
	}else{
		socket.emit('chat message', "Wrong Password.")
		socket.emit('prompt request', 'loginUsername', "Enter your username: ");
	}
}

function login(socket, userId){
	exports.mySqlModule.select("*", "users", "id = '" + userId + "'", function(result, socket){
		socket.userId = result[0].id;
		socket.username = result[0].username;

		socket.emit('chat message', 'Password accepted.');
		socket.emit('chat message', "Welcome, " + socket.username + ".");
		characterSelectScreen(socket);
	}, socket);
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
			socket.emit('prompt request', 'characterInitialization', "Which would you like to load? (1, 2, 3)");
		});
	});
}

function characterInitialization(io, socket, promptType, promptReply){
	//regex expression to check if it's 1,2,3
	let regex = /^[123]$/;
	if (regex.test(promptReply)){
		socket.currentCharacter = promptReply;
		exports.mySqlModule.select("*", "users", "id = '" + socket.userId + "'", function(result){
			let characterIds = result[0].characters.split(",");
			let targetCharacterId = characterIds[promptReply];
			if(targetCharacterId == -1){
				//character creation
				socket.emit('chat message', "Character creation started.");
				socket.emit('prompt request', 'characterCreationFirstName', "What is your first name?");
			}else{
				//load character
				socket.emit('chat message', "Loading character.");
			}
		});
	}else{
		socket.emit('chat message', "Please enter 1, 2, or 3.");
		characterSelectScreen(socket);
	}
	
}

function characterCreationFirstName(io, socket, promptType, promptReply){
	socket.temp.firstname = promptReply;
	if(isUsernameValid(socket.temp.firstname)){ //need isCharacterName regex to check for numbers and symbols except hyphen
		confirmPrompt(socket, 'Do you really want your first name to be ' + socket.temp.firstname + '? (Y/N)', 
			function(){ 
				socket.emit('prompt request', 'characterCreationLastName', "What is your last name?");
			}, 
			function(){
				socket.emit('prompt request', 'characterCreationFirstName', "What is your first name?");
			}
		);
	}else{
		socket.emit('chat message', "First Name is invalid.<br>" +
					">First name should be between 0 and 16 characters<br>" +
					">Should only contain letters and hyphen"
					);
		socket.emit('prompt request', 'characterCreationFirstName', "What is your first name?");
	}
}

function characterCreationLastName(io, socket, promptType, promptReply){
	socket.temp.lastname = promptReply;
	if(isUsernameValid(socket.temp.lastname)){ //need isCharacterName regex to check for numbers and symbols except hyphen
		confirmPrompt(socket, 'Do you really want your last name to be ' + socket.temp.lastname + '? (Y/N)', 
			function(){ 
				socket.emit('prompt request', 'characterCreationRace', "What is your race?");
		}, 
			function(){
				socket.emit('prompt request', 'characterCreationLastName', "What is your last name?");
			}
		);
	}else{
		socket.emit('chat message', "Last Name is invalid.<br>" +
					">Last name should be between 0 and 16 characters<br>" +
					">Should only contain letters and hyphen"
					);
		socket.emit('prompt request', 'characterCreationFirstName', "What is your first name?");
	}
}

function characterCreationRace(io, socket, promptType, promptReply){
	exports.mySqlModule.select("*", "races",  "name = '" + promptReply + "'", function(result, socket){
		if(result.length > 0){
			socket.temp.raceid = result[0].id;
			socket.temp.race = promptReply;
			confirmPrompt(socket, 'Are you okay with being a(n) ' + socket.temp.race + '? (Y/N)', 
				function(){ 
					socket.emit('prompt request', 'characterCreationClass', "What is your class?");
				}, 
				function(){
					socket.emit('prompt request', 'characterCreationRace', "What is your race?");
				}
			);
		}else{
			socket.emit('chat message', "Chararacter Race invalid");
			exports.mySqlModule.select("*", "races",  "", function(result, socket){
				let availableRaces = result[0].name + "";
				for(let i = 1; i < result.length; i++){
					availableRaces += ", " + result[i].name;
				}
				socket.emit('chat message', "Available Chararacter Races: " + availableRaces);
				socket.emit('prompt request', 'characterCreationRace', "What is your race?");
			}, socket);
		}	
	}, socket);
}

function characterCreationClass(io, socket, promptType, promptReply){
	exports.mySqlModule.select("*", "classes",  "name = '" + promptReply + "'", function(result, socket){
		if(result.length > 0){
			socket.temp.classid = result[0].id;
			socket.temp.class = promptReply;
			confirmPrompt(socket, 'Are you okay with being a(n) ' + socket.temp.class + '? (Y/N)', 
				function(){ 
					characterCreationComplete(socket);
				}, 
				function(){
					socket.emit('prompt request', 'characterCreationClass', "What is your class?")
				}
			);
		}else{
			socket.emit('chat message', "Chararacter Class invalid");
			exports.mySqlModule.select("*", "classes",  "", function(result, socket){
				let availableClasses = result[0].name + "";
				for(let i = 1; i < result.length; i++){
					availableClasses += ", " + result[i].name;
				}
				socket.emit('chat message', "Available Character Classes: " + availableClasses);
				socket.emit('prompt request', 'characterCreationClass', "What is your class?")
			}, socket);
		}	
	}, socket);
}

function characterCreationComplete(socket){
	socket.emit('chat message', "first name: " + socket.temp.firstname + "<br>last name: " + socket.temp.lastname + "<br>race: " + socket.temp.race + "<br>class: " + socket.temp.class);
	confirmPrompt(socket, 'Are you okay with this? (Y/N)',
		function(){
			socket.emit('chat message', "character function lol");
			//createCharacter(socket); //inserts crap into mysql then references character initialization screen
		}, 
		function(){
			socket.emit('chat message', "Character creation restarted.");
			socket.emit('prompt request', 'characterCreationFirstName', "What is your first name?");
		}
	);
}

function createCharacter(socket){
	//insert socket.temp.firstname, socket.temp.lastname, socket.temp.raceid, socket.temp.classid into user

	socket.mySqlModule.insert("characters", "firstname, lastname, race, class", socket.temp.firstname, socket.temp.lastname, socket.temp.raceid, socket.temp.classid);
	//find associated character id
	
	//change associated characters(1,-1,-1) in users with characters-id
	//go back to character initialization
	characterSelectScreen(socket);
}

function confirm(io, socket, promptType, promptReply){
	switch(promptReply.toLowerCase()){
		case "y":
		case "yes":
			socket.temp.yesCallback(io, socket);
		break;
		case "n":
		case "no":
			socket.temp.noCallback(io, socket);
		break;
		default:
		socket.emit('chat message', promptReply + ' is an invalid response. <br> >Try Y/N');
		socket.emit('prompt request', 'confirm', socket.temp.confirmMessage);
	}
}

function confirmPrompt(socket, message, yesCallback, noCallback){
	socket.temp.yesCallback = yesCallback;
	socket.temp.noCallback = noCallback;
	socket.temp.confirmMessage = message;
	socket.emit('prompt request', 'confirm', message);
}