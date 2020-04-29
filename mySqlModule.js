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

exports.registerAccount = function(username, password){
	console.log("account created");
	console.log("username: " + username);
	console.log("password: " + password);
  	insert("users", "username, password", username, password);
}

exports.checkUsername = function(username, socket, callback){
	var sql = "SELECT * FROM users WHERE username = '" + username + "';";
	let query = con.query(sql, function(err, result){
		if(err) throw err;
		callback(!(result.length > 0), username, socket);
	});
}

function insert(table, column, variable){
	let valueToInsert = variable;
	for(let i = 3; i < arguments.length ; i++){
		valueToInsert += "','" + arguments[i];
	}
	var sql =  "insert into " + table + "(" + column + ")" + " values ('" + valueToInsert + "');";
	con.query(sql, function (err, result) {
	if (err) throw err;
	console.log("1 record inserted");
	});
}

