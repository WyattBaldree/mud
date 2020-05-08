const mySqlModule = require('./mySqlModule');

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
	exports.getCharacterFromSocket(socket, function(character){	
		exports.messageToClient(socket, "Welcome, " + character.characters_firstName + " " + character.characters_lastName + ".");
		exports.move(socket, 1, " pops into existence.", " fades before disappearing.");
	});
}

exports.getAllPlayersInRoom = function(room, callback){
	//return a list of all players in the room provided
	mySqlModule.select("rooms_playerList", "rooms", "id = '" + room + "'", function(result){
		let playerList = result[0].rooms_playerList.split(",");
		callback(playerList);
	});
}

exports.getAllPlayersInRoomOnline = function(room, callback){
	exports.getAllPlayersInRoom(room, function(playerList){
		let connectedPlayerList = [];
		let connectedSockets = exports.getAllConnectedSockets();
		for(let player of playerList){
			//if player or id is in socket list push to connectedPlayerList
			//loop through connectedPlayer playerlist
			for(let i = 0 ; i < connectedSockets.length ; i++){

				if(connectedSockets[i].currentCharacter == player){
					connectedPlayerList.push(player);

				}
			}
		}
		console.log("playerlist" + connectedPlayerList);
		callback(connectedPlayerList);
	})
}

exports.getCharacterFromSocket = function(socket,callback){
	//socket.currentCharacter is called at character load in promptHandlerModule
	mySqlModule.select("*", "characters", "id = '" + socket.currentCharacter + "'", function(result){
		if (result.length >= 0){
			callback(result[0]);
		}else{
			callback(null);
		}
	})
}

exports.getSocketFromCharacter = function(characterId, callback){
	let sockets = exports.getAllConnectedSockets();
	console.log(sockets.length);
	for(let s of sockets){
		if(s.currentCharacter == characterId){
			callback(s);
			return;
		}
	}
}

exports.getAllConnectedSockets = function(){
	let sockets = [];
	for(let s of Object.keys(ioRef.sockets.connected)){
		sockets.push(ioRef.sockets.connected[s]);
	}
	return sockets;
}

exports.move = function(socket, toRoom, arriveMessage, leaveMessage){
	mySqlModule.select("a.*, b.rooms_north, b.rooms_east, b.rooms_south, b.rooms_west",
		"characters a, rooms b",
		"b.id = a.characters_currentRoom",
		function(result){
			let currentCharacterResult = result.find(element => element.id == socket.currentCharacter);
			let fN = currentCharacterResult.characters_firstName;
			let lN = currentCharacterResult.characters_lastName;
			let currentRoom = currentCharacterResult.characters_currentRoom;

			
			exports.moveCharacter(socket, toRoom, function(){
				crossRoomsMessages(socket, fN, lN, currentRoom, toRoom, arriveMessage, leaveMessage);
			});
		});
}

exports.moveDirection = function(socket, direction){

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
						exports.move(socket, currentCharacterResult.rooms_north, " enters the area from the south.", " leaves the area to the north.");
						return;
					}else{
						exports.messageToClient(socket, "<color:red>I'm unable to move in that direction.")
					}
					break;
				case 1:
					if(currentCharacterResult.rooms_east != -1){
						exports.move(socket, currentCharacterResult.rooms_east, " enters the area from the west.", " leaves the area to the east.");
						return;
					}else{
						exports.messageToClient(socket, "<color:red>I'm unable to move in that direction.")
					}
					break;
				case 2:
					if(currentCharacterResult.rooms_south != -1){
						exports.move(socket, currentCharacterResult.rooms_south, " enters the area from the north.", " leaves the area to the south.");
						return;
					}else{
						exports.messageToClient(socket, "<color:red>I'm unable to move in that direction.")
					}
					break;
				case 3:
					if(currentCharacterResult.rooms_west != -1){
						exports.move(socket, currentCharacterResult.rooms_west, " enters the area from the east.", " leaves the area to the west.");
						return;
					}else{
						exports.messageToClient(socket, "<color:red>I'm unable to move in that direction.")
					}
					break;
			}

		});
}

exports.moveCharacter = function(socket, toRoom, callback){
	mySqlModule.select(	"a.id, a.characters_currentRoom, b.rooms_playerList, b.rooms_description",
	"characters a, rooms b", "b.id = a.characters_currentRoom",
	function(result){
		let currentCharacterResult = result.find(element => element.id == socket.currentCharacter);
		let playerArray = currentCharacterResult.rooms_playerList.split(',');
		playerArray.splice(playerArray.indexOf(socket.currentCharacter), 1, socket.currentCharacter);
		let oldRoomPlayerList = "";
		for(let playerId of playerArray){
			if(playerId != "" && playerId != socket.currentCharacter){
				oldRoomPlayerList = oldRoomPlayerList + playerId + ","
			}
		}
		mySqlModule.update("rooms", "rooms_playerList = '" + oldRoomPlayerList + "'", "id = '" + currentCharacterResult.characters_currentRoom + "'", function(){
			mySqlModule.select(	"rooms_playerList, rooms_description",
				"rooms",
				"id = " + toRoom,
				function(toRoomResult){
					let newRoomPlayerList = toRoomResult[0].rooms_playerList + socket.currentCharacter + ",";

					mySqlModule.update("rooms", "rooms_playerList = '" + newRoomPlayerList + "'", "id = '" + toRoom + "'", function(){
						mySqlModule.update("characters", "characters_currentRoom = '" + toRoom + "'", "id = '" + socket.currentCharacter + "'", function(){
							// Do something efter the move has completed.
							callback();
						});
					});
				});
			});
	});
}

function crossRoomsMessages(socket, firstName, lastName, fromRoom, toRoom, arriveMessage, leaveMessage){
	mySqlModule.select("id, characters_currentRoom", "characters", "", function(charactersResult){
		for(let currentSocket of exports.getAllConnectedSockets()){
			if(currentSocket.currentCharacter != null && currentSocket.userId != socket.userId){
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
		exports.describeRoom(socket, toRoom);
	});
}

exports.describeRoom = function(socket, roomId){
	mySqlModule.select("rooms_description, rooms_playerList", "rooms", "id = " + roomId, function(result){
		let roomDescription = result[0].rooms_description;
		console.log("playersincurrentroom" + result[0].rooms_playerList);

		mySqlModule.select("id, characters_firstName, characters_lastName", "characters", "characters_currentRoom = " + roomId, function(charactersResult){
			if(charactersResult.length > 0){
				let charactersInRoomDescription = "";
				//if characterid is in connectedPlayerList then add them
				exports.getAllPlayersInRoomOnline(roomId, function(connectedPlayerList){
					console.log("asdsada" + connectedPlayerList);
					console.log("charactersResult" + charactersResult);
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
					if(charactersInRoomDescription == ""){
						charactersInRoomDescription = "<br>You are alone.";
					}
					socket.emit('chat message', roomDescription + charactersInRoomDescription);
				})
			}else{
				let charactersInRoomDescription = "<br>You see no one.";
				socket.emit('chat message', roomDescription + charactersInRoomDescription);
			}

		});
	});
}

exports.say = function(socket, message){
	let socketList = exports.getAllConnectedSockets();


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

exports.messageInRoom = function(roomId, message){
	exports.getAllPlayersInRoomOnline(roomId, function(connectedPlayerList){
		console.log("connectedPlayerList: " + connectedPlayerList);
		for(connectedPlayer of connectedPlayerList){
			console.log("connectedPlayer: " + connectedPlayer);
			exports.getSocketFromCharacter(connectedPlayer, function(socket){
				exports.messageToClient(socket, message);
				console.log("driiiip")
			})
		}
	})
}

exports.messageToClient = function(socket, message){
	socket.emit("chat message", message);
}

exports.messageToAll = function(message){
	ioRef.emit("chat message", message);
}

exports.getMyCharacter = function(socket, callback){
	mySqlModule.select("*", "characters", "id = " + socket.currentCharacter, function(result){
		callback(result[0]);
	});
}
