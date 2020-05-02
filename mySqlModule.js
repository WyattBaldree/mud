var mysql = require('mysql');

var con = mysql.createConnection({
	host: "localhost",
	user: "deniella",
	password: "test1234",
	database: "mud"
});

con.connect(function(err) {
	if (err) throw err;
	console.log("Connected to mysql!");
});

exports.select =  function(selectList, table, where, callback){
	let argumentArray = [];
	for(let i = 4; i < arguments.length ; i++){
		argumentArray.push(arguments[i]);
	}
	let whereStr = "";
	if(where != ""){
		whereStr = " WHERE " + where;
	}
	var sql = "SELECT " + selectList + " FROM " + table + whereStr + ";";

	console.log(sql);

	let query = con.query(sql, function(err, result){
		if(err) throw err;
		argumentArray.unshift(result);
		if(callback){
			callback.apply(this, argumentArray);
		}
	});
}

exports.insert = function(table, columns, variables, callback){
	let argumentArray = [];
	for(let i = 4; i < arguments.length ; i++){
		argumentArray.push(arguments[i]);
	}

	var sql =  "insert into " + table + " (" + columns + ")" + " values ('" + variables + "');";
	let query = con.query(sql, function(err, result){
		if(err) throw err;
		argumentArray.unshift(result);
		if(callback){
			callback.apply(this, argumentArray);
		}
	});
}

exports.update = function(table, set, where, callback){
	let argumentArray = [];
	for(let i = 4; i < arguments.length ; i++){
		argumentArray.push(arguments[i]);
	}

	var sql =  "UPDATE " + table + " SET " + set + " WHERE " + where + ";";
	let query = con.query(sql, function(err, result){
		if(err) throw err;
		argumentArray.unshift(result);
		if(callback){
			callback.apply(this, argumentArray);
		}
	});
}

exports.moveCharacter = function(socket, toRoom){
	exports.select(	"a.characters_currentRoom, b.rooms_playerList, b.rooms_description",
	"characters a, rooms b", 
	"a.id = " + socket.currentCharacter + " AND b.id = a.characters_currentRoom",
	function(result){
		let playerArray = result[0].rooms_playerList.split(',');
		console.log("player array: " + playerArray);
		console.log("player array[0]: " + playerArray[0]);
		playerArray.splice(playerArray.indexOf(socket.currentCharacter), 1, socket.currentCharacter);
		let oldRoomPlayerList = "";
		for(let playerId of playerArray){
			console.log(playerId + " : " + socket.currentCharacter);
			if(playerId != "" && playerId != socket.currentCharacter){
				console.log("sdkfjlj: " + playerId + " : " + socket.currentCharacter);
				oldRoomPlayerList = oldRoomPlayerList + playerId + ","
			}
		}
		exports.update("rooms", "rooms_playerList = '" + oldRoomPlayerList + "'", "id = '" + result[0].characters_currentRoom + "'", function(){
			exports.select(	"rooms_playerList, rooms_description",
				"rooms", 
				"id = " + toRoom,
				function(toRoomResult){
					console.log(toRoomResult);
					let newRoomPlayerList = toRoomResult[0].rooms_playerList + socket.currentCharacter + ",";
				
					exports.update("rooms", "rooms_playerList = '" + newRoomPlayerList + "'", "id = '" + toRoom + "'", function(){
						exports.update("characters", "characters_currentRoom = '" + toRoom + "'", "id = '" + socket.currentCharacter + "'", function(){
							socket.emit('chat message', toRoomResult[0].rooms_description);
						});
					});
				});
			});

		//socket.emit('chat message', 'Current Room: ' + result[0].characters_currentRoom + '<br>Player List: ' + result[0].rooms_playerList);
	});
}