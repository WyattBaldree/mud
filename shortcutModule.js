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