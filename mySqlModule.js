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

	let whereStr = "";
	if(where != ""){
		whereStr = " WHERE " + where;
	}

	var sql =  "UPDATE " + table + " SET " + set + whereStr + ";";
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