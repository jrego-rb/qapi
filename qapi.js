var restify = require('restify');
var mysql = require('mysql');
var http = require('http');
var curl = require('curlrequest');
var fs = require('fs');
var db_values = require('./db.json');

var con = false;
var parameters = '';
var coretx_url = process.env.CORETX_URL
var site = '';
var subsites_list = '';

String.prototype.escapeSpecialChars = function() {
    return this.replace(/,/g, ",\n").replace(/{\"/g, "{\n\"").replace('[', '[\n').replace('},\n', '\n},\n').replace('}]', '}\n]\n');
};

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

function setParameters(req, res, next) {
	parameters = req.params;		
	if (parameters.site) {
		site = parameters.site;
	}
	if (parameters.subsites) {
		subsites_list = parameters.subsites.split(',');		
	}
	res.send('200', 'Parameters was set succesfully.');
}

function editDtxTest(req, res, next) {
	var fileName = req.body;
	var file = require(fileName);
	
	file.item[1].request.url =  'http://localhost:19000/replication/site/' + site;
	file.item[5].request.url =  'http://localhost:19000/replication/site/' + site;

	var raw_json = JSON.parse(file.item[3].request.body.raw);
	
	raw_json.amount = 1000 * subsites_list.length;

	for (i = 0; i < subsites_list.length; i++) {
		raw_json.sub_payments[i].site_id = subsites_list[i];
		raw_json.sub_payments[i].installments = 5;
		raw_json.sub_payments[i].amount = 1000;			
		console.log('agregado el subsite');	
	}

	string_raw = JSON.stringify(raw_json);

	escaped_string_raw = string_raw.escapeSpecialChars();

	file.item[3].request.body.raw = escaped_string_raw;

	fs.writeFileSync(fileName, JSON.stringify(file, null, 2), function (err) {
	if (err) return console.log(err);
		console.log(JSON.stringify(file));
		console.log('writing to ' + fileName);
	});

	res.send(200, 'Iteration Data file was edited successfully.');
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
	for(i = 0; i < subsites_list.length; i++) {			
		var insert_query = "INSERT INTO spssites_subsites VALUES ('" + site + "', '" + subsites_list[i] + "', 0, 'S','" + date_time + "', NULL)";
		con.query(insert_query, function (error, results, fields) {
	  		if (error) throw error; 
			console.log('Subsite inserted!');	  		
		});
	}
	closeDB();
	setTimeout((function() {res.send(200, 'All subsites was inserted successfully.');}), 3000);
}

// Función para remover el subsite de la tabla
function deleteSubsite(req, res, next) {
	connectDB();
	for(i = 0; i < subsites_list.length; i++) {
		var delete_query = "DELETE FROM spssites_subsites WHERE idsite = '" + site + "' AND idsubsite = '" + subsites_list[i] + "'";
		con.query(delete_query, function (error, results, fields) {
	  		if (error) throw error;
	  		console.log('Subsite deleted!');
		});
	}
	closeDB();
	setTimeout((function() {res.send(200, 'All subsites was deleted successfully.');}), 3000);
	
}

var server = restify.createServer();

server.use(restify.bodyParser());

server.post('/newman/parameters', setParameters);
server.post('/newman/parameters/dtx', editDtxTest);
server.post('/sites/subsites', insertSubsite);
server.del('/sites/subsites', deleteSubsite);

server.listen('8080', function() {
	console.log('%s listening at %s', server.name, server.url);
});


//curl.request({url:'http://localhost:8080/sites/03101986/subsites/03101988', method:'POST'});
