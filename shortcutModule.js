const mySqlModule = require('./mySqlModule');
exports.getAllPlayersInRoom = function(room, callback){
	//return a list of all players in the room provided
	mySqlModule.select("rooms_playerList", "rooms", "id = " + room, function(result){
		let playerList = result[0].rooms_playerList.split(",");
		callback(playerList);
	});
}

exports.getAllPlayersInRoomOnline = function(io, room, callback){
	exports.getAllPlayersInRoom(room, function(playerList){
		let connectedPlayerList = [];
		let connectedSockets = exports.getAllConnectedSockets(io);
		for(player of playerList){
			//if player or id is in socket list push to connectedPlayerList
			if(player == connectedSockets.currentCharacter){
				connectedPlayerList.push(player);
			}
		}
		callback(connectedPlayerList);
	})
}

exports.getCharacterFromSocket = function(socket,callback){
	//socket.currentCharacter is called at character load in promptHandlerModule
	mySqlModule.select("*", "characters", "id = '" + socket.currentCharacter + "''", function(result){
		if (result.length >= 0){
			callback(result[0]);
		}else{
			callback(null);
		}
	})
}

exports.getSocketFromCharacter = function(io, characterId, callback){
	let sockets = exports.getAllConnectedSockets(io);
	for(let s of sockets){
		if(s.currentCharacter == characterId){
			return s;
		}
	}
	return null;
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
	mySqlModule.select("id, characters_currentRoom, characters_firstName, characters_lastName", "characters", "", function(charactersTableResult){
		let myCharacter = charactersTableResult.find(element => element.id == socket.currentCharacter);
		let originRoom = myCharacter.characters_currentRoom;
		let myName = myCharacter.characters_firstName + " " + myCharacter.characters_lastName;

		let finalMessage = "<b>" + myName + ": </b>" + message;

		for(let c of charactersTableResult){
			if(c.characters_currentRoom == originRoom){
				let characterSocket = socketList.find(element => element.currentCharacter == c.id);
				if(characterSocket){
					exports.messageToClient(characterSocket, finalMessage);
				}
			}
		}
	});
}

exports.messageInRoom = function(io,roomId, message){
	exports.getAllPlayersInRoomOnline(io, room, function(connectedPlayerList){
		for(connectedPlayer of connectedPlayerList){
			exports.getSocketFromCharacter(io, connectedPlayer, function(socket){
				exports.messageToClient(socket, message);
			})
		}	
	})
}

exports.messageToClient = function(socket, message){
	socket.emit("chat message", message);
}

exports.messageToAll = function(io, message){
	io.emit("chat message", message);
}

exports.getMyCharacter = function(socket, callback){
	mySqlModule.select("*", "characters", "id = " + socket.currentCharacter, function(result){
		callback(result[0]);
	});
}
