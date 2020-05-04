const mySqlModule = require('./mySqlModule');
function getAllPlayersInRoom(){

}

exports.getAllConnectedSockets = function(io){
	let sockets = [];
	for(let s of Object.keys(io.sockets.connected)){
		sockets.push(io.sockets.connected[s]);
	}
	return sockets;
}

exports.describeRoom = function(socket, roomId){
	mySqlModule.select("rooms_description, rooms_playerList", "rooms", "id = " + roomId, function(result){
		let roomDescription = result[0].rooms_description;

		mySqlModule.select("characters_firstName, characters_lastName", "characters", "characters_currentRoom = " + roomId, function(charactersResult){
			if(charactersResult.length > 0){
				roomDescription += "<br>You see the following players:"

				for(let character of charactersResult){
					roomDescription += "<br>     " + character.characters_firstName + " " + character.characters_lastName;
				}
			}else{
				roomDescription += "<br>You are alone.";
			}
			

			socket.emit('chat message', roomDescription);
		});		
	});
}

exports.say = function(io, socket, message){
	let socketList = exports.getAllConnectedSockets(io);
	//find all characters in same room.
		//check if each character has a socket currently controlling it.
			//if so, say to them.
	mySqlModule.select("id, characters_currentRoom", "characters", "", function(charactersTableResult){
		let originRoom = charactersTableResult.find(element => element.id == socket.currentCharacter).characters_currentRoom;

		for(let c of charactersTableResult){
			if(c.characters_currentRoom == originRoom){
				let characterSocket = socketList.find(element => element.currentCharacter == c.id);
				if(characterSocket){
					exports.messageToClient(characterSocket, message);
				}
			}
		}
	});
}

exports.messageInRoom = function(io,roomId, message){

}

exports.messageToClient = function(socket, message){
	socket.emit("chat message", message);
}

exports.messageToAll = function(io, message){
	io.emit("chat message", message);
}