exports.handleCommand = function(io, socket, command){
	let commandArray = command.split(";");

	let availableCommandArray = ["say"]

	switch(commandArray[0].trim().toLowerCase()){
		case "say":
			io.emit('chat message', socket.username + ": " + commandArray[1]);
			break;
		case "help":
			socket.emit('chat message', "HELP:");
			socket.emit('chat message', "> To use a command, type \"<command>;<param 1>;<param 2>;...\"");
			socket.emit('chat message', "> For example: say;hello everyone");
			socket.emit('chat message', "> The available commands are: " + availableCommandArray);
			break;
		default:
			socket.emit('chat message', "invalid command try 'help'");
			break;	
	}
}