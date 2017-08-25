var restify = require('restify');
var mysql = require('mysql');
var db_values = require('./db.json');

var con = false;
var parameters = '';
var coretx_url = process.env.CORETX_URL
var site = '';
var subsites_list = '';


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


// Función para activar CyberSource en un sitio
function setAgregador(req, res, next) {
	connectDB();
	site = req.params.site;
	var update_query = "UPDATE spssites SET agregador = 'S' WHERE idsite = '" + site + "'";
	con.query(update_query, function (error, results, fields) {
		if (error) throw error; 
		console.log('Agregador enabled!');
	});	
	closeDB();
	setTimeout((function() {res.send(200, 'The site was edited successfully.');}), 3000);	  		
}

function unsetAgregador(req, res, next) {
	connectDB();
	site = req.params.site;
	var update_query = "UPDATE spssites SET agregador = 'N' WHERE idsite = '" + site + "'";
	con.query(update_query, function (error, results, fields) {
		if (error) throw error; 
		console.log('Agregador enabled!');
	});	
	closeDB();
	setTimeout((function() {res.send(200, 'The site was edited successfully.');}), 3000);	  		
}

function setCS(req, res, next) {
	connectDB();
	site = req.params.site;
	modelo = req.params.modelo;
	mid = req.params.mid;
	rubro = req.params.rubro;
	continuar = req.params.continuar;
	reverso = req.params.reverso;	
	security_key = req.params.security_key;
	var update_query = "UPDATE spssites SET flagcs = 'S', modelocs = '" + modelo + "', mid = '" + mid + "', securitykey = '" + security_key + "', rubro = '" + rubro + "', autorizaseguir = '" + continuar + "', csreversiontimeout = '" + reverso + "' WHERE idsite = '" + site + "'";
	con.query(update_query, function (error, results, fields) {
		if (error) throw error; 
		console.log('CS enabled!');
	});	
	closeDB();
	setTimeout((function() {res.send(200, 'The site was edited successfully.');}), 3000);	  		
}

// Función para desactivar CyberSource en un sitio
function unsetCS(req, res, next) {
	connectDB();
	site = req.params.site;
	var update_query = "UPDATE spssites SET flagcs = 'N', modelocs = NULL, mid = '', securitykey = '', rubro = NULL, autorizaseguir = 'N', csreversiontimeout = 'N' WHERE idsite = '" + site + "'";
	con.query(update_query, function (error, results, fields) {
		if (error) throw error; 
		console.log('CS disabled!');
	});	
	closeDB();
	setTimeout((function() {res.send(200, 'The site was edited successfully.');}), 3000);	  		
}

// Función para insertar el subsite en la tabla
function insertSubsite(req, res, next) {
	connectDB();
	var date_time = getDateTime();
	site = req.params.site;
	subsites_list = req.params.subsites;
	console.log(subsites_list);	
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
	site = req.params.site;
	subsites_list = req.params.subsites;
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

server.post('/sites/subsites', insertSubsite);
server.post('/sites/agregador', setAgregador);
server.post('/sites/cs', setCS);
server.del('/sites/subsites', deleteSubsite);
server.del('/sites/cs', unsetCS);
server.del('/sites/agregador', unsetAgregador);

server.listen('8080', function() {
	console.log('%s listening at %s', server.name, server.url);
});
