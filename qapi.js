var restify = require('restify');
var mysql = require('mysql');
var http = require('http');
var curl = require('curlrequest');
var db_values = require('./db.json');

var con = false;
var coretx_url = process.env.CORETX_URL

// Función para tomar la fecha actual y darle el formato YYYY-MM-DD HH:MM:SS
function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

}

// Función para conectarse a la base
function connectDB() {
	con = mysql.createConnection(db_values);
	con.connect(function(err) {
	  if (err) throw err;
	  	console.log("Connected!");
	});
}


// Función para cerrar la conexión a la base
function closeDB() {
	con.end(function(err) {
		if (err) throw err;
		console.log("Connection Closed!");
	});
}

// Función para insertar el subsite en la tabla
function insertSubsite(req, res, next) {
	connectDB();
	var date_time = getDateTime();
	for(var subsite in req.body.subsites) {			
		var insert_query = "INSERT INTO spssites_subsites VALUES ('" + req.body.site + "', '" + req.body.subsites[subsite] + "', 0, 'S','" + date_time + "', NULL)";
		con.query(insert_query, function (error, results, fields) {
	  		if (error) throw error; 
			console.log('Subsite inserted!');	  		
		});
	}
	closeDB();
	res.send(200, 'All subsites was inserted successfully.');
}

// Función para remover el subsite de la tabla
function deleteSubsite(req, res, next) {
	connectDB();
	for(var subsite in req.body.subsites) {
		var delete_query = "DELETE FROM spssites_subsites WHERE idsite = '" + req.body.site + "' AND idsubsite = '" + req.body.subsites[subsite] + "'";
		con.query(delete_query, function (error, results, fields) {
	  		if (error) throw error;
	  		console.log('Subsite ' + req.body.subsites[subsite] + ' deleted!');
		});
	}
	closeDB();
	res.send(200, 'All subsites was deleted successfully.');
}

var server = restify.createServer();

server.use(restify.bodyParser());

server.post('/sites/subsites', insertSubsite);
server.del('/sites/subsites', deleteSubsite);

server.listen('8080', function() {
	console.log('%s listening at %s', server.name, server.url);
});


//curl.request({url:'http://localhost:8080/sites/03101986/subsites/03101988', method:'POST'});
