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

exports.delete = function(table, where, callback){
	//DELETE FROM somelog WHERE user = 'jcole'
	let argumentArray = [];
	for(let i = 3; i < arguments.length ; i++){
		argumentArray.push(arguments[i]);
	}

	var sql = "DELETE FROM " + table + " WHERE " + where + ";";
	let query = con.query(sql, function(err,result){
		if (err) throw err;
		argumentArray.unshift(result);
		if(callback){
			callback.apply(this, argumentArray);
		}
	})
}

exports.moveCharacter = function(socket, toRoom, callback){
	exports.select(	"a.id, a.characters_currentRoom, b.rooms_playerList, b.rooms_description",
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
		exports.update("rooms", "rooms_playerList = '" + oldRoomPlayerList + "'", "id = '" + currentCharacterResult.characters_currentRoom + "'", function(){
			exports.select(	"rooms_playerList, rooms_description",
				"rooms",
				"id = " + toRoom,
				function(toRoomResult){
					let newRoomPlayerList = toRoomResult[0].rooms_playerList + socket.currentCharacter + ",";

					exports.update("rooms", "rooms_playerList = '" + newRoomPlayerList + "'", "id = '" + toRoom + "'", function(){
						exports.update("characters", "characters_currentRoom = '" + toRoom + "'", "id = '" + socket.currentCharacter + "'", function(){
							// Do something efter the move has completed.
							callback();
						});
					});
				});
			});
	});
}
