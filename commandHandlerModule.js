const mySqlModule = require('./mySqlModule');
const shortcutModule = require('./shortcutModule');

exports.handleCommand = function(io, socket, command){
	let commandArray = command.split(";");

	switch(commandArray[0].trim().toLowerCase()){
		case "n":
		case "north":
			moveDirection(io, socket, 0);
			break;
		case "e":
		case "east":
			moveDirection(io, socket, 1);
			break;
		case "s":
		case "south":
			moveDirection(io, socket, 2);
			break;
		case "w":
		case "west":
			moveDirection(io, socket, 3);
			break;
		case "look":
			shortcutModule.getMyCharacter(socket, function(myCharacter){
				shortcutModule.describeRoom(socket, myCharacter.characters_currentRoom);
			});
			break;
		case "say":
			shortcutModule.say(io, socket, commandArray[1]);
			break;
		case "dice":
			rollDice(io, socket, commandArray);
			break;
		case "help":
			shortcutModule.messageToClient(socket, 
				"<b>HELP:</b><br>" + 
				"To use a command, type \"<command>;<param 1>;<param 2>;...\"<br>" + 
				"For example: say;hello everyone<br>" + 
				"The available commands are: say, dice, look");
			break;
		default:
			shortcutModule.messageToClient(socket, "<color:red>Invalid command try 'help'");
			break;	
	}
}

function rollDice(io, socket, commandArray){
	if(commandArray.length < 2){
		shortcutModule.messageToClient(socket, "<color:red>Dice requires a parameter. Try \"dice;3d6\".");
		return;
	}
	let diceStr = commandArray[1].trim();
	if(/\dd\d/g.test(diceStr)){
		let diceValues = diceStr.split("d");
		shortcutModule.say(io, socket, socket.username + " rolls " + diceStr + ".");
		let total = 0
		let totalStr = "";
		for(let i = 0 ; i < diceValues[0] ; i++){
			let roll = Math.ceil(Math.random() * diceValues[1]);
			total += roll;
			if(i == 0){
				totalStr += roll;
			}
			else{
				totalStr += " + " + roll;
			}
		}
		shortcutModule.say(io, socket, socket.username + " rolled " + total  + " (" + totalStr + ").");
	}
	else{
		shortcutModule.messageToClient(socket, "<color:red>\"" + commandArray[1] + "\" is not a valid dice type. Try \"dice;3d6\".");
	}
}

exports.move = function(io, socket, toRoom, arriveMessage, leaveMessage){

	mySqlModule.select("a.*, b.rooms_north, b.rooms_east, b.rooms_south, b.rooms_west", 
		"characters a, rooms b", 
		"b.id = a.characters_currentRoom",
		function(result){
			let currentCharacterResult = result.find(element => element.id == socket.currentCharacter);
			let fN = currentCharacterResult.characters_firstName;
			let lN = currentCharacterResult.characters_lastName;
			let currentRoom = currentCharacterResult.characters_currentRoom;

			crossRoomsMessages(io, socket, fN, lN, currentRoom, toRoom, arriveMessage, leaveMessage);
			mySqlModule.moveCharacter(socket, toRoom);
		});
}

function moveDirection(io, socket, direction){

	mySqlModule.select("a.*, b.rooms_north, b.rooms_east, b.rooms_south, b.rooms_west", 
		"characters a, rooms b", 
		"b.id = a.characters_currentRoom",
		function(result){
			let currentCharacterResult = result.find(element => element.id == socket.currentCharacter);
			let fN = currentCharacterResult.characters_firstName;
			let lN = currentCharacterResult.characters_lastName;
			let currentRoom = currentCharacterResult.characters_currentRoom;
			switch(direction){
				case 0:
					if(currentCharacterResult.rooms_north != -1){
						exports.move(io, socket, currentCharacterResult.rooms_north, " enters the area from the south.", " leaves the area to the north.");
						return;
					}else{
						shortcutModule.messageToClient(socket, "<color:red>I'm unable to move in that direction.")
					}
					break;
				case 1:
					if(currentCharacterResult.rooms_east != -1){
						exports.move(io, socket, currentCharacterResult.rooms_east, " enters the area from the west.", " leaves the area to the east.");
						return;
					}else{
						shortcutModule.messageToClient(socket, "<color:red>I'm unable to move in that direction.")
					}
					break;
				case 2:
					if(currentCharacterResult.rooms_south != -1){
						exports.move(io, socket, currentCharacterResult.rooms_south, " enters the area from the north.", " leaves the area to the south.");
						return;
					}else{
						shortcutModule.messageToClient(socket, "<color:red>I'm unable to move in that direction.")
					}
					break;
				case 3:
					if(currentCharacterResult.rooms_west != -1){
						exports.move(io, socket, currentCharacterResult.rooms_west, " enters the area from the east.", " leaves the area to the west.");
						return;
					}else{
						shortcutModule.messageToClient(socket, "<color:red>I'm unable to move in that direction.")
					}
					break;
			}

		});
}
function crossRoomsMessages(io, socket, firstName, lastName, fromRoom, toRoom, arriveMessage, leaveMessage){
	mySqlModule.select("id, characters_currentRoom", "characters", "", function(charactersResult){
		for(let currentSocket of shortcutModule.getAllConnectedSockets(io)){
			if(currentSocket.currentCharacter != null && currentSocket.userId != socket.userId){
				//this socket is logged in as a character and is not the socket thatis  doing the move.
				let currentSocketCharacter = charactersResult.find(element => element.id == currentSocket.currentCharacter);

				console.log(JSON.stringify(currentSocketCharacter));

				if(currentSocketCharacter.characters_currentRoom == fromRoom){
					shortcutModule.messageToClient(currentSocket, firstName + " " + lastName + leaveMessage);
				}
				if(currentSocketCharacter.characters_currentRoom == toRoom){
					shortcutModule.messageToClient(currentSocket, firstName + " " + lastName + arriveMessage);
				}
			}
		}
	});
	
	shortcutModule.describeRoom(socket, toRoom);
}