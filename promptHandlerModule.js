exports.handlePromptReply = function(io, socket, promptType, promptReply){
	switch(promptType){
		case "username":
			socket.username = promptReply;
			break;
		default:
			console.log("Prompt type, " + promptType + ", not recognized.");
			break;	
	}
}