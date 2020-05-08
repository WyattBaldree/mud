const mySqlModule = require('./mySqlModule');
const promptHandlerModule = require('./promptHandlerModule');
const shortcutModule = require('./shortcutModule');


var ioRef = null;
exports.start = function(io) {
	ioRef = io;
    io.on('connection', function(socket) {
		socket.on('command', function(command){
			handleCommand(socket, command);
		});
    });
};


function handleCommand(socket, command){
	let commandArray = command.split(";");

	switch(commandArray[0].trim().toLowerCase()){
		case "n":
		case "north":
			move(socket, 0);
			break;
		case "e":
		case "east":
			move(socket, 1);
			break;
		case "s":
		case "south":
			move(socket, 2);
			break;
		case "w":
		case "west":
			move(socket, 3);
			break;
		case "look":
			shortcutModule.getMyCharacter(socket, function(myCharacter){
				shortcutModule.describeRoomMessage(socket, myCharacter.characters_currentRoom);
			});
			break;
		case "say":
			if (commandArray.length > 1){
				shortcutModule.say(socket, commandArray[1]);
			}else{
				shortcutModule.messageToClient(socket, "<color:red>Invalid command try 'say;<message>'");
			}
			break;
		case "dice":
			rollDice(socket, commandArray);
			break;
		case "logout":
			shortcutModule.logout(socket);
			break;
		case "help":
			shortcutModule.messageToClient(socket,
				"<b>HELP:</b><br>" +
				"To use a command, type \"<command>;<param 1>;<param 2>;...\"<br>" +
				"For example: say;hello everyone<br>" +
				"The available commands are: say, dice, look, logout");
			break;
		default:
			shortcutModule.messageToClient(socket, "<color:red>Invalid command try 'help'");
			break;
	}
}

function move(socket, direction){
	shortcutModule.moveDirection(socket, direction, "You enter ", " enters the area from the ", " leaves the area to the ");
}

function rollDice(socket, commandArray){
	if(commandArray.length < 2){
		shortcutModule.messageToClient(socket, "<color:red>Dice requires a parameter. Try \"dice;3d6\".");
		return;
	}
	let diceStr = commandArray[1].trim();
	if(/\dd\d/g.test(diceStr)){
		let diceValues = diceStr.split("d");
		console.log("AAAAAAAAAAAAAA");
		console.log("socket current character"  + socket.currentCharacter);
		shortcutModule.getMyCharacter(socket, function(myCharacter){
			console.log("mycharacter" + myCharacter);
			let currentRoom = myCharacter.characters_currentRoom;
			let charactersName = myCharacter.characters_firstName + " " + myCharacter.characters_lastName;
			shortcutModule.messageInRoom(currentRoom, charactersName + " rolls " + diceStr + ".")
			let total = 0;
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
			shortcutModule.messageInRoom(currentRoom, charactersName + " rolled " + total  + " (" + totalStr + ").")
		})
	}
	else{
		shortcutModule.messageToClient(socket, "<color:red>\"" + commandArray[1] + "\" is not a valid dice type. Try \"dice;3d6\".");
	}
}
