/*exports.moveCharacter = function(socket, toRoom){
	exports.mySqlModule.select(	"a.characters_currentRoom, b.rooms_playerList",
								"characters a, rooms b", 
								"a.id = " + socket.currentCharacter + " AND b.id = a.characters_currentRoom", 
								function(result){
									emit.('chat message', 'Current Room: ' + result[0].characters_currentRoom + '<br>Player List: ' + result[0].rooms_playerList);
								});
}*/