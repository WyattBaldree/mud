const mySqlModule = require('./mySqlModule');
const characterModule = require('./characterModule');

var ioRef = null;
exports.start = function(io) {
	ioRef = io;
};

exports.logout = function(socket){
	mySqlModule.update("users", "users_online = '0'", "id = '" + socket.userId + "'", function(result){
		socket.emit("prompt request" , "accountInitialization", "Login or Register?", "accountInitialization");
	});
}

exports.login = function(socket){
	mySqlModule.update("users", "users_online = '1'", "id = '" + socket.userId + "'", function(result){
		exports.messageToClient(socket, "Welcome to Abscondia.");
	});
}

exports.loadCharacter = function(socket, characterId){
	socket.currentCharacter = characterId;
	characterModule.getCharacterFromSocket(socket, function(character){
		exports.messageToClient(socket, "Welcome, " + character.characters_firstName + " " + character.characters_lastName + ".");
		characterModule.move(socket, 1, "You suddenly appear in ", " pops into existence.", " fades before disappearing.");
	});
}

exports.getAllConnectedSockets = function(){
	let sockets = [];
	for(let s of Object.keys(ioRef.sockets.connected)){
		sockets.push(ioRef.sockets.connected[s]);
	}
	return sockets;
}

exports.crossRoomsMessages = function(socket, firstName, lastName, fromRoom, toRoom, enterMessage, arriveMessage, leaveMessage){
	mySqlModule.select("id, characters_currentRoom", "characters", "", function(charactersResult){
		for(let currentSocket of exports.getAllConnectedSockets()){
            if (currentSocket.currentCharacter != null && currentSocket.currentCharacter != -1 && currentSocket.userId != socket.userId){
				//this socket is logged in as a character and is not the socket thatis  doing the move.
				let currentSocketCharacter = charactersResult.find(element => element.id == currentSocket.currentCharacter);

				console.log(JSON.stringify(currentSocketCharacter));

				if(currentSocketCharacter.characters_currentRoom == fromRoom){
					exports.messageToClient(currentSocket, firstName + " " + lastName + leaveMessage);
				}
				if(currentSocketCharacter.characters_currentRoom == toRoom){
					exports.messageToClient(currentSocket, firstName + " " + lastName + arriveMessage);
				}
			}
		}
		exports.enterRoomMessage(socket, enterMessage, toRoom);
		exports.describeRoomMessage(socket, toRoom);
	});
}

exports.describeRoomMessage = function(socket, roomId){
	mySqlModule.select("rooms_description, rooms_playerList", "rooms", "id = " + roomId, function(result){
		let roomDescription = result[0].rooms_description;
		mySqlModule.select("id, characters_firstName, characters_lastName", "characters", "characters_currentRoom = " + roomId, function(charactersResult){
			if(charactersResult.length > 0){
				let charactersInRoomDescription = "";
				//if characterid is in connectedPlayerList then add them
                characterModule.getAllCharacterIdsInRoomOnline(roomId, function(connectedPlayerList){
					for(let character of charactersResult){
						for(let i = 0; i < connectedPlayerList.length ; i++){
							if(character.id == connectedPlayerList[i] && character.id != socket.currentCharacter){
								if(charactersInRoomDescription == ""){
									charactersInRoomDescription += "You see the following characters:";
								}
								charactersInRoomDescription += "<br>     " + character.characters_firstName + " " + character.characters_lastName;
							}
						}
					}
					/*if(charactersInRoomDescription == ""){
						charactersInRoomDescription = "<br>You are alone.";
					}*/
					socket.emit('chat message', roomDescription + charactersInRoomDescription);
				})
			}else{
				let charactersInRoomDescription = "<br>You see no one.";
				socket.emit('chat message', roomDescription + charactersInRoomDescription);
			}
		});
	});
}

exports.enterRoomMessage = function(socket, enterMessage, roomId){
	mySqlModule.select("rooms_name", "rooms", "id = " + roomId, function(result){
		let roomName = result[0].rooms_name;
		socket.emit('chat message', enterMessage + roomName + ".");
	});
}

exports.messageInRoom = function(roomId, message){
    characterModule.getAllCharacterIdsInRoomOnline(roomId, function(connectedPlayerList){
		console.log("connectedPlayerList: " + connectedPlayerList);
		for(connectedPlayer of connectedPlayerList){
			console.log("connectedPlayer: " + connectedPlayer);
			characterModule.getSocketFromCharacter(connectedPlayer, function(socket){
				exports.messageToClient(socket, message);
				console.log("driiiip")
			})
		}
	})
}

exports.messageToClient = function(socket, message){
	socket.emit("chat message", message);
}

exports.messageToAll = function (message) {
    ioRef.emit("chat message", message);
}

exports.capitalizeFirstLetter = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}