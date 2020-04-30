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
		callback.apply(this, argumentArray);
	});
}

exports.insert = function(table, column, variables){
	let valueToInsert = variable;
	for(let i = 3; i < arguments.length ; i++){
		valueToInsert += "','" + arguments[i];
	}
	var sql =  "insert into " + table + "(" + column + ")" + " values ('" + valueToInsert + "');";
	con.query(sql, function (err, result) {
		if (err) throw err;
		socket.temp.insertedId = result[0].id
		console.log("1 record inserted");
	});
}

