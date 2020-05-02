exports.handleCommand = function(io, socket, command){
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
		case "say":
			io.emit('chat message', socket.username + ": " + commandArray[1]);
			break;
		case "dice":
			rollDice(io, socket, commandArray);
			break;
		case "help":
			socket.emit('chat message', "HELP:<br>" + 
										"> To use a command, type \"<command>;<param 1>;<param 2>;...\"<br>" + 
										"> For example: say;hello everyone<br>" + 
										"> The available commands are: say, dice");
			break;
		default:
			socket.emit('chat message', "invalid command try 'help'");
			break;	
	}
}

function rollDice(io, socket, commandArray){
	if(commandArray.length < 2){
		socket.emit('chat message', "Dice requires a parameter. Try \"dice;3d6\".");
		return;
	}
	let diceStr = commandArray[1].trim();
	if(/\dd\d/g.test(diceStr)){
		let diceValues = diceStr.split("d");
		io.emit('chat message', socket.username + " rolls " + diceStr + ".");
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
		io.emit('chat message', socket.username + " rolled " + total  + " (" + totalStr + ").");
	}
	else{
		socket.emit('chat message', "\"" + commandArray[1] + "\" is not a valid dice type. Try \"dice;3d6\".");
	}
}

function move(socket, direction){

	exports.mySqlModule.select("a.rooms_north, a.rooms_east, a.rooms_south, a.rooms_west", 
		"rooms a, characters b", 
		"b.id = " + socket.currentCharacter + " AND a.id = b.characters_currentRoom",
		function(result){
			let toRoom = -1;
			switch(direction){
				case 0:
					if(result[0].rooms_north != -1){
						exports.mySqlModule.moveCharacter(socket, result[0].rooms_north);
						return;
					}
					break;
				case 1:
					if(result[0].rooms_east != -1){
						exports.mySqlModule.moveCharacter(socket, result[0].rooms_east);
						return;
					}
					break;
				case 2:
					if(result[0].rooms_south != -1){
						exports.mySqlModule.moveCharacter(socket, result[0].rooms_south);
						return;
					}
					break;
				case 3:
					if(result[0].rooms_west != -1){
						exports.mySqlModule.moveCharacter(socket, result[0].rooms_west);
						return;
					}
					break;
			}

			socket.emit("chat message", "I'm unable to move in that direction.")
		});
}