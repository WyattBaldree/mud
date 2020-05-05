const usernameMaxLength = 16;
const usernameMinLength = 3;
const nameMaxLength = 16;
const nameMinLength = 3;

const mySqlModule = require('./mySqlModule');
const commandHandlerModule = require('./commandHandlerModule');
const shortcutModule = require('./shortcutModule');

exports.handlePromptReply = function(io, socket, promptType, promptReply, exitPromptType = ""){
	if(promptReply.toLowerCase() == "exit"){
		if(exitPromptType != ""){
			promptType = exitPromptType
		} else{
			return;
		}
	}

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
		case "characterSelectScreen":
			characterSelectScreen(socket);
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
			confirm(io, socket, promptType, promptReply, exitPromptType);
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
			shortcutModule.messageToClient(socket, 'Login started.');
			socket.emit('prompt request', 'loginUsername', "Enter your username: ", "accountInitialization");
			break;
		case "r":
		case "register":
			socket.temp = {
				username: "",
				password: ""
				};
			shortcutModule.messageToClient(socket, 'Registration started.');
			socket.emit('prompt request', 'regUsername', "Register your username: ", "accountInitialization");
			break;
		default:
			shortcutModule.messageToClient(socket, '<color:red>Invalid choice. Try typing register or login.');
			socket.emit('prompt request', "accountInitialization", "Login or Register?", "accountInitialization");
	}
}

function regUsername(io, socket, promptType, promptReply){
	if(!isUsernameValid(promptReply)){
		shortcutModule.messageToClient(socket, "<color:red>Username Invalid. Username requires:<br>" + 
									">at least 3 characters<br>" +
									">no more than 16 characters<br>" +
									">none of the following: ~`!@#$%^&*+=-[]\';,\\/{}|\":<>?()._" 
					);
		socket.emit('prompt request', 'regUsername', "Register your username: ", "accountInitialization");
	}
	else{
		mySqlModule.select("*", "users", "users_username = '" + promptReply + "'", regUsernameCallback, promptReply, socket);
	}
}

function regUsernameCallback(result, username, socket){
	if(result.length <= 0){ //if promptReply is a valid username
		socket.temp.username = username;
		shortcutModule.messageToClient(socket, 'Username, '+ username + ', accepted.');
		shortcutModule.messageToClient(socket, 'Please be aware server admins can see registered passwords.');
		socket.emit('prompt request', 'regPassword', "Register your password: ","accountInitialization");
	}else{
		shortcutModule.messageToClient(socket, "Username taken.")
		socket.emit('prompt request', 'regUsername', "Register your username: ", "accountInitialization");
	}
}

function isUsernameValid(username){
	return !/[\s~`!@#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?()\._]/g.test(username) && username.length <= 16 && username.length >=3;
}

function isNameValid(username){
	return !/[\d\s~`!@#$%\^&*+=\\[\]\\';,/{}|\\":<>\?()\._]/g.test(username) && username.length <= 16 && username.length >=3;
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
		mySqlModule.insert("users", "users_username, users_password", socket.temp.username + "','" + socket.temp.password, null);
		shortcutModule.messageToClient(socket, 'Password accepted.');
		shortcutModule.messageToClient(socket, "Account successfully created.")
		socket.emit('prompt request', 'accountInitialization', "Login or Register?", "accountInitialization");
	}else{
		shortcutModule.messageToClient(socket, "<color:red>Password Invalid. Password requires:<br>" + 
									">at least 1 lower case character<br>" +
									">at least 1 upper case character<br>" +
									">at least 6 characters<br>" +
									">no more than 18 characters"
					);
		socket.emit('prompt request', 'regPassword', "Register your password: ", "accountInitialization");
	}
}

function loginUsername(io, socket, promptType, promptReply){
	if(!isUsernameValid(promptReply)){
		shortcutModule.messageToClient(socket, "<color:red>Username Invalid.");
		socket.emit('prompt request', 'loginUsername', "Enter your username: ", "accountInitialization");
	}
	else{
		mySqlModule.select("*", "users", "users_username = '" + promptReply + "'", loginUsernameCallback, promptReply, socket);
	}
}

function loginUsernameCallback(result, username, socket){
	if(result.length > 0){ //if promptReply is a valid username
		socket.temp.username = username;
		shortcutModule.messageToClient(socket, 'Username, '+ username + ', accepted.');
		socket.emit('prompt request', 'loginPassword', "Enter your password: ", "accountInitialization");
	}else{
		shortcutModule.messageToClient(socket, "<color:red>Username does not exist.")
		socket.emit('prompt request', 'loginUsername', "Enter your username: ", "accountInitialization");
	}
}

function loginPassword(io, socket, promptType, promptReply){

	let where = "users_username = '" + socket.temp.username + "' AND users_password = '" + promptReply +"'";
	mySqlModule.select("*", "users", where, loginPasswordCallback, promptReply, socket);
	
}

function loginPasswordCallback(result, password, socket){
	if(result.length > 0){ //if the account exists.
		login(socket, result[0].id);
	}else{
		shortcutModule.messageToClient(socket, "<color:red>Wrong Password.")
		socket.emit('prompt request', 'loginUsername', "Enter your username: ", "accountInitialization");
	}
}

function login(socket, userId){
	mySqlModule.select("*", "users", "id = '" + userId + "'", function(result, socket){
		socket.userId = result[0].id;
		socket.username = result[0].users_username;

		shortcutModule.messageToClient(socket, 'Password accepted.');
		shortcutModule.messageToClient(socket, "Welcome, " + socket.username + ".");
		characterSelectScreen(socket);
	}, socket);
}

function characterSelectScreen(socket){//redo  with new multiselect
	mySqlModule.select("*", "users", "id = '" + socket.userId + "'", function(userResult){
		mySqlModule.select("*", "characters", "", function(characterResult){
			mySqlModule.select("*", "classes", "", function(classResult){
				let characterIds = userResult.find(element => element.id == socket.userId).users_characters.split(",");
				let charactersInfo = "Your characters: ";
				for(let i = 0 ; i < characterIds.length ; i++){
					if(characterIds[i] == -1){
						charactersInfo = charactersInfo + "<br>" + (i+1) + ") ------------- NEW CHARACTER -------------";
					}else{
						let characterObj = characterResult.find(element => element.id == characterIds[i]);
						let classObj = classResult.find(element => element.id == characterObj.characters_class);
						charactersInfo = charactersInfo + "<br>" + (i+1) + ") Name: " + characterObj.characters_firstName + " Class: " + classObj.classes_name;
					}
				}

				shortcutModule.messageToClient(socket, charactersInfo);
				socket.emit('prompt request', 'characterInitialization', "Which would you like to load or delete? (1, 2, 3)", "accountInitialization");
			});
		});
	});
}

function characterInitialization(io, socket, promptType, promptReply){
	//regex expression to check if it's 1,2,3
	let loadRegex = /^[123]$/;
	let delRegex = /^(del )+[123]$/;
	if (loadRegex.test(promptReply.trim())){
		socket.temp.currentCharacterSlot = promptReply;
		mySqlModule.select("*", "users", "id = '" + socket.userId + "'", function(result){
			let characterIds = result[0].users_characters.split(",");
			let targetCharacterId = characterIds[promptReply-1];
			socket.currentCharacter = targetCharacterId;
			if(targetCharacterId == -1){
				//character creation
				shortcutModule.messageToClient(socket, "Character creation started.");
				socket.emit('prompt request', 'characterCreationFirstName', "What is your first name?", "characterSelectScreen");
			}else{
				//load character
				shortcutModule.messageToClient(socket, "Loading character...");
				commandHandlerModule.move(io, socket, 1, " pops into existence.", " fades before disappearing.");
			}
		});
	}
	else if(delRegex.test(promptReply.toLowerCase().trim())){
		socket.temp.currentCharacterSlot = promptReply.split(" ")[1];
		confirmPrompt(socket, "are you sure you want to delete? (Y/N)", "characterSelectScreen", 
			function(){
				//select user to open character string array
				mySqlModule.select("*", "users", "id = '" + socket.userId + "'", function(currentUserResult){
					let characterIds = currentUserResult[0].users_characters.split(",");
					socket.temp.characterToRemove = characterIds[socket.temp.currentCharacterSlot - 1];
					console.log("socket.temp.characterToRemove" + socket.temp.characterToRemove);
					characterIds[socket.temp.currentCharacterSlot - 1] = -1;
					//update character string with -1
					mySqlModule.update("users", "users_characters ='" + characterIds.toString() + "'", "id ='" + socket.userId + "'", function(result){
						//multiselect to find room where character was last
						mySqlModule.select("a.characters_currentRoom, b.id, b.rooms_playerList", "characters a, rooms b", "a.id = " + socket.temp.characterToRemove + " AND b.id = a.characters_currentRoom", function(currentRoomResult){
							//open character string array of rooms_playerList
							console.log(currentRoomResult);
							let roomsPlayerList = currentRoomResult[0].rooms_playerList.split(",");
							console.log("roomsPlayerList: " + roomsPlayerList);
							//find the index where the characters id is located
							let index = -1;
							for(let i = 0; i < roomsPlayerList.length; i++){
								if(roomsPlayerList[i] == socket.temp.characterToRemove){
									index = i;
									break;
								}
							}
							roomsPlayerList.splice(index,1);
							console.log("roomsPlayerList after splice: " + roomsPlayerList);
							console.log("currentRoomResult[0].id" + currentRoomResult[0].id); 
							//update rooms with updated string array
							mySqlModule.update("rooms", "rooms_playerList= '" + roomsPlayerList.toString() + "'", "id = '" + currentRoomResult[0].id + "'", function(){
								mySqlModule.delete("characters", "id = '" + socket.temp.characterToRemove + "'", function(result){
									shortcutModule.messageToClient(socket, "Character deleted!");
									characterSelectScreen(socket); 
								})
							})
						})	
					})
				})
			}, 
			function(){
				characterSelectScreen(socket);
			})
	}
	else{
		shortcutModule.messageToClient(socket, "Please enter 1, 2, or 3 to load a character or del 1, del 2 , or del 3 to delete a character.");
		characterSelectScreen(socket);
	}
	
}

function characterCreationFirstName(io, socket, promptType, promptReply){
	socket.temp.firstname = promptReply;
	if(isUsernameValid(socket.temp.firstname)){ //need isCharacterName regex to check for numbers and symbols except hyphen
		confirmPrompt(socket, 'Is ' + socket.temp.firstname + ' okay? (Y/N)', "characterSelectScreen", 
			function(){ 
				socket.emit('prompt request', 'characterCreationLastName', "What is your last name?", "characterSelectScreen");
			}, 
			function(){
				socket.emit('prompt request', 'characterCreationFirstName', "What is your first name?", "characterSelectScreen");
			}
		);
	}else{
		shortcutModule.messageToClient(socket, "<color:red>First Name is invalid.<br>" +
					">First name should be between 0 and 16 characters<br>" +
					">Should only contain letters and hyphen"
					);
		socket.emit('prompt request', 'characterCreationFirstName', "What is your first name?", "characterSelectScreen");
	}
}

function characterCreationLastName(io, socket, promptType, promptReply){
	socket.temp.lastname = promptReply;
	if(isUsernameValid(socket.temp.lastname)){ //need isCharacterName regex to check for numbers and symbols except hyphen
		confirmPrompt(socket, 'Is ' + socket.temp.lastname + ' okay? (Y/N)', "characterSelectScreen",
			function(){ 
				mySqlModule.select("*", "races",  "", function(result, socket){
				let availableRaces = result[0].races_name + "";
				for(let i = 1; i < result.length; i++){
					availableRaces += ", " + result[i].races_name;
				}
				shortcutModule.messageToClient(socket, "Available Chararacter Races: " + availableRaces);
				socket.emit('prompt request', 'characterCreationRace', "What is your race?", "characterSelectScreen");
				}, socket);
			}, 
			function(){
				socket.emit('prompt request', 'characterCreationLastName', "What is your last name?", "characterSelectScreen");
			}
		);
	}else{
		shortcutModule.messageToClient(socket, "<color:red>Last Name is invalid.<br>" +
					">Last name should be between 0 and 16 characters<br>" +
					">Should only contain letters and hyphen"
					);
		socket.emit('prompt request', 'characterCreationFirstName', "What is your first name?", "characterSelectScreen");
	}
}

function characterCreationRace(io, socket, promptType, promptReply){
	mySqlModule.select("*", "races",  "races_name = '" + promptReply + "'", function(result, socket){
		if(result.length > 0){
			socket.temp.raceid = result[0].id;
			socket.temp.race = promptReply;
			confirmPrompt(socket, 'Is ' + socket.temp.race + ' okay? (Y/N)', "characterSelectScreen",
				function(){ 
					mySqlModule.select("*", "classes",  "", function(result, socket){
						let availableClasses = result[0].classes_name + "";
						for(let i = 1; i < result.length; i++){
						availableClasses += ", " + result[i].classes_name;
					}
					shortcutModule.messageToClient(socket, "Available Character Classes: " + availableClasses);
					socket.emit('prompt request', 'characterCreationClass', "What is your class?", "characterSelectScreen")
					}, socket);
				}, 
				function(){
					socket.emit('prompt request', 'characterCreationRace', "What is your race?", "characterSelectScreen");
				}
			);
		}else{
			shortcutModule.messageToClient(socket, "Chararacter Race invalid");
			mySqlModule.select("*", "races",  "", function(result, socket){
				let availableRaces = result[0].races_name + "";
				for(let i = 1; i < result.length; i++){
					availableRaces += ", " + result[i].races_name;
				}
				shortcutModule.messageToClient(socket, "<color:red>Available Chararacter Races: " + availableRaces);
				socket.emit('prompt request', 'characterCreationRace', "What is your race?", "characterSelectScreen");
			}, socket);
		}	
	}, socket);
}

function characterCreationClass(io, socket, promptType, promptReply){
	mySqlModule.select("*", "classes",  "classes_name = '" + promptReply + "'", function(result, socket){
		if(result.length > 0){
			socket.temp.classid = result[0].id;
			socket.temp.class = promptReply;
			confirmPrompt(socket, 'Is ' + socket.temp.class + ' okay? (Y/N)', "characterSelectScreen",
				function(){ 
					characterCreationComplete(socket);
				}, 
				function(){
					socket.emit('prompt request', 'characterCreationClass', "What is your class?", "characterSelectScreen")
				}
			);
		}else{
			shortcutModule.messageToClient(socket, "Chararacter Class invalid");
			mySqlModule.select("*", "classes",  "", function(result, socket){
				let availableClasses = result[0].classes_name + "";
				for(let i = 1; i < result.length; i++){
					availableClasses += ", " + result[i].classes_name;
				}
				shortcutModule.messageToClient(socket, "<color:red>Available Character Classes: " + availableClasses);
				socket.emit('prompt request', 'characterCreationClass', "What is your class?", "characterSelectScreen")
			}, socket);
		}	
	}, socket);
}

function characterCreationComplete(socket){
	shortcutModule.messageToClient(socket, 	"<b>First Name: </b>" + socket.temp.firstname + 
											"<br><b>last name: </b>" + socket.temp.lastname + 
											"<br><b>race: </b>" + socket.temp.race + 
											"<br><b>class: </b>" + socket.temp.class);
	confirmPrompt(socket, 'Are you okay with this? (Y/N)', "characterSelectScreen",
		function(){
			shortcutModule.messageToClient(socket, "<color:yellow><b>character function lol");
			createCharacter(socket);
		}, 
		function(){
			shortcutModule.messageToClient(socket, "Character creation restarted.");
			socket.emit('prompt request', 'characterCreationFirstName', "What is your first name?", "characterSelectScreen");
		}
	);
}

function createCharacter(socket){
	//insert socket.temp.firstname, socket.temp.lastname, socket.temp.raceid, socket.temp.classid into user
	let characterInfo = socket.temp.firstname + "','" +
						socket.temp.lastname + "','" +
						socket.temp.raceid + "','" +
						socket.temp.classid + "','" +
						0;
	mySqlModule.insert("characters", "characters_firstname,characters_lastname,characters_race,characters_class,characters_currentRoom", characterInfo, function(insertResult){
		mySqlModule.select("*", "users",  "id = " + socket.userId, function(userResult){
			let myCharacters = userResult[0].users_characters.split(","); //split character string by ,
			myCharacters[socket.temp.currentCharacterSlot-1] = insertResult.insertId; //change current character with new id. insertId returns autogenerated id from the latest query.

			mySqlModule.update("users", "users_characters = '" + myCharacters.toString() + "'", "id = '" + socket.userId + "'", function(result){
				characterSelectScreen(socket);
			})

		});
	});
	//find associated character id
}

function confirm(io, socket, promptType, promptReply, exitPromptType){
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
		shortcutModule.messageToClient(socket, "<color:red>" + promptReply + ' is an invalid response. <br> >Try Y/N');
		socket.emit('prompt request', 'confirm', socket.temp.confirmMessage, exitPromptType);
	}
}

function confirmPrompt(socket, message, exitPromptType, yesCallback, noCallback){
	socket.temp.yesCallback = yesCallback;
	socket.temp.noCallback = noCallback;
	socket.temp.confirmMessage = message;
	socket.emit('prompt request', 'confirm', message, exitPromptType);
}