exports.handleCommand = function(io, socket, command){
	let commandArray = command.split(";");

	switch(commandArray[0].trim().toLowerCase()){
		case "s":
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