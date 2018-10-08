const crypto = require('crypto'),
	algorithm = 'aes-256-ctr',
	password = 'qsr-str-mrt';
var restify = require('restify');
var mysql = require('mysql');
var db_values = {};
var program = require('commander');
var version = require('version-healthcheck');
var vepone = {"id": 1, "title": "json-server", "author": "typicode" };

program
  .version('0.1.0')
  .option('-h, --host [type]', 'Host a utilizar')
  .option('-p, --port [type]', 'Puerto a utilizar')
  .option('-s, --schema [type]', 'Nombre de base de datos a utilizar')
  .option('-u, --user [type]', 'Nombre de usuario a utilizar (encriptado)')
  .option('-w, --pass [type]', 'Password de usuario a utilizar (encriptado)')
  .option('-r, --redisPort [type]', 'Puerto de Redis a utilizar')
   .option('-r, --redisHost [type]', 'Host de Redis a utilizar')
  .parse(process.argv);	


//function encrypt(text){
  //var cipher = crypto.createCipher(algorithm,password)
  //var crypted = cipher.update(text,'utf8','hex')
  //crypted += cipher.final('hex');
  //return crypted;
 // }


function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

var con = false;
var parameters = '';
var site = '';
var subsites_list = '';

if (process.env.DB_HOST) {
  db_values.host = process.env.DB_HOST;
} else if (program.host) {
  db_values.host = program.host;
}

if (process.env.DB_PORT) {
  db_values.port = process.env.DB_PORT;
} else if (program.port) {
  db_values.port = program.port;
}


if (process.env.DB_SCHEMA) {
  db_values.database = process.env.DB_SCHEMA;
} else if (program.schema) {
  db_values.database = program.schema;
}

if (process.env.DB_USER) {
  db_values.user = decrypt(process.env.DB_USER);
} else if (program.user) {
  db_values.user = decrypt(program.user);
}

if (process.env.DB_PASSWORD) {
  db_values.password = decrypt(process.env.DB_PASSWORD);
} else if (program.pass) {
  db_values.password = decrypt(program.pass);
}

if (process.env.REDIS_PORT) {
  redis_port = process.env.REDIS_PORT;
} else if (program.redisPort) {
  redis_port = program.redisPort;
}

if (process.env.REDIS_HOST) {
  redis_host = process.env.REDIS_HOST;
} else if (program.redisHost) {
  redis_host = program.redisHost;
}

var redis = require('redis');
var client = redis.createClient(redis_port,redis_host);
client.on('connect', function() {
    console.log('connected');
});

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
	  	console.log("¡Se conectó a la base de datos con éxito!");
	});
}

// Función para cerrar la conexión a la base
function closeDB() {
	con.end(function(err) {
		if (err) throw err;
		console.log("¡Conexión a la base de datos cerrada!");
	});
}

// Función para activar agregador en un sitio
function setAgregador(req, res, next) {
	connectDB();
	site = req.params.site;
	var update_query = "UPDATE spssites SET agregador = 'S' WHERE idsite = '" + site + "'";
	con.query(update_query, function (error, results, fields) {
		if (error) throw error; 
		console.log('Agregador configurado.');
	});	
	closeDB();
	setTimeout((function() {res.send(200, 'El sitio fue editado con éxito.');}), 3000);	  		
}

// Función para desactivar Agregador en un sitio
function unsetAgregador(req, res, next) {
	connectDB();
	site = req.params.site;
	var update_query = "UPDATE spssites SET agregador = 'N' WHERE idsite = '" + site + "'";
	con.query(update_query, function (error, results, fields) {
		if (error) throw error; 
		console.log('¡Agregador desconfigurado!');
	});	
	closeDB();
	setTimeout((function() {res.send(200, 'El sitio fue editado con éxito.');}), 3000);	  		
}

// Función para activar agregador en un sitio
function setReutilizacion(req, res, next) {
	connectDB();
	site = req.params.site;
	var update_query = "UPDATE spssites SET reutilizartransaccion = 'S' WHERE idsite = '" + site + "'";
	con.query(update_query, function (error, results, fields) {
		if (error) throw error; 
		console.log('Reutilizacion de transaccion configurado.');
	});	
	closeDB();
	setTimeout((function() {res.send(200, 'El sitio fue editado con éxito.');}), 3000);	  		
}

// Función para desactivar Agregador en un sitio
function unsetReutilizacion(req, res, next) {
	connectDB();
	site = req.params.site;
	var update_query = "UPDATE spssites SET reutilizartransaccion = 'N' WHERE idsite = '" + site + "'";
	con.query(update_query, function (error, results, fields) {
		if (error) throw error; 
		console.log('¡Reutilizacion de transaccion desconfigurado.!');
	});	
	closeDB();
	setTimeout((function() {res.send(200, 'El sitio fue editado con éxito.');}), 3000);	  		
}

// Función para activar tokenization en un sitio
function setTokenization(req, res, next) {
	connectDB();
	site = req.params.site;
	var update_query = "UPDATE spssites SET tokenized = 1 WHERE idsite = '" + site + "'";
	con.query(update_query, function (error, results, fields) {
		if (error) throw error; 
		console.log('Tokenization configurada.');
	});	
	closeDB();
	setTimeout((function() {res.send(200, 'El sitio fue editado con éxito.');}), 3000);	  		
}

// Función para desactivar tokenization en un sitio
function unsetTokenization(req, res, next) {
	connectDB();
	site = req.params.site;
	var update_query = "UPDATE spssites SET tokenized = 0 WHERE idsite = '" + site + "'";
	con.query(update_query, function (error, results, fields) {
		if (error) throw error; 
		console.log('¡Tokenization desconfigurada!');
	});	
	closeDB();
	setTimeout((function() {res.send(200, 'El sitio fue editado con éxito.');}), 3000);	  		
}

// Función para activar tokenization en un sitio
function setMPOS(req, res, next) {
	connectDB();
	site = req.params.site;
	var update_query = "UPDATE spssites SET mensajeria_mpos = 'S' WHERE idsite = '" + site + "'";
	con.query(update_query, function (error, results, fields) {
		if (error) throw error; 
		console.log('MPOS configurado.');
	});	
	closeDB();
	setTimeout((function() {res.send(200, 'El sitio fue editado con éxito.');}), 3000);	  		
}

// Función para desactivar tokenization en un sitio
function unsetMPOS(req, res, next) {
	connectDB();
	site = req.params.site;
	var update_query = "UPDATE spssites SET mensajeria_mpos = 'N' WHERE idsite = '" + site + "'";
	con.query(update_query, function (error, results, fields) {
		if (error) throw error; 
		console.log('¡MPOS desconfigurado!');
	});	
	closeDB();
	setTimeout((function() {res.send(200, 'El sitio fue editado con éxito.');}), 3000);	  		
}

// Función para activar distribuidas por porcentaje en un sitio
function setPorcentaje(req, res, next) {
	connectDB();
	site = req.params.site;
	// calcula el valor porcentual dependiendo de la cantidad de subsites, dejando margen para el site padre	
	var count_query = "SELECT COUNT (DISTINCT idsubsite) AS total FROM spssites_subsites WHERE idsite = '" + site + "'";		

	con.query(count_query, function (error, results, fields) {
		if (error) throw error;				
		var count = results[0].total;					
		console.log('Se encontraron ' + String(count) + ' subsites registrados');	
		valor_porcentaje = String(Math.floor(90 / count));
		var update_query = "UPDATE spssites SET montoporcent = 'P' WHERE idsite = '" + site + "'";	
		con.query(update_query, function (error, results, fields) {
			if (error) throw error; 
			console.log('Pago porcentual habilitado.');
		});	
		var update_query = "UPDATE spssites_subsites SET porcentaje = '" + valor_porcentaje + "', activo = 'S' WHERE idsite = '" + site + "'";
		con.query(update_query, function (error, results, fields) {
			if (error) throw error; 
			console.log('Se le configuró a cada subsite un porcentaje de ' + valor_porcentaje + '%');
		});
		closeDB();	
	});
	setTimeout((function() {res.send(200, 'El sitio fue editado con éxito.');}), 3000);	  		
}

// Un burdo copypaste de setPorcentaje(), pero desconsiderando el porcentaje para el sitio padre.
function setPorcentajeWithoutFatherSitePercentage(req, res, next) {
	connectDB();
	site = req.params.site;
	// calcula el valor porcentual dependiendo de la cantidad de subsites, dejando margen para el site padre	
	var count_query = "SELECT COUNT (DISTINCT idsubsite) AS total FROM spssites_subsites WHERE idsite = '" + site + "'";		

	con.query(count_query, function (error, results, fields) {
		if (error) throw error;				
		var count = results[0].total;					
		console.log('Se encontraron ' + String(count) + ' subsites registrados');	
		valor_porcentaje = String(Math.floor(100 / count));
		var update_query = "UPDATE spssites SET montoporcent = 'P' WHERE idsite = '" + site + "'";	
		con.query(update_query, function (error, results, fields) {
			if (error) throw error; 
			console.log('Pago porcentual habilitado.');
		});	
		var update_query = "UPDATE spssites_subsites SET porcentaje = '" + valor_porcentaje + "', activo = 'S' WHERE idsite = '" + site + "'";
		con.query(update_query, function (error, results, fields) {
			if (error) throw error; 
			console.log('Se le configuró a cada subsite un porcentaje de ' + valor_porcentaje + '%');
		});
		closeDB();	
	});
	setTimeout((function() {res.send(200, 'El sitio fue editado con éxito.');}), 3000);	  		
}

// Función para desactivar porcentaje en un sitio
function unsetPorcentaje(req, res, next) {
	connectDB();
	site = req.params.site;
	var update_query = "UPDATE spssites SET montoporcent = 'M' WHERE idsite = '" + site + "'";
	con.query(update_query, function (error, results, fields) {
		if (error) throw error; 
		console.log('¡Se elimino la configuración de pago por monto!');
	});
	var update_query = "UPDATE spssites_subsites SET porcentaje = '0' WHERE idsite = '" + site + "'";
	con.query(update_query, function (error, results, fields) {
		if (error) throw error; 
		console.log('Se reestablecieron los subsites a porcentaje cero.');
	});	
	closeDB();
	setTimeout((function() {res.send(200, 'El sitio fue editado con éxito.');}), 3000);	  		
}

// Función para activar CyberSource en un sitio
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
		console.log('¡CS configurado!');
	});	
	closeDB();
	setTimeout((function() {res.send(200, 'El sitio fue editado con éxito.');}), 3000);	  		
}

// Función para desactivar CyberSource en un sitio
function unsetCS(req, res, next) {
	connectDB();
	site = req.params.site;
	var update_query = "UPDATE spssites SET flagcs = 'N', modelocs = NULL, mid = '', securitykey = '', rubro = NULL, autorizaseguir = 'N', csreversiontimeout = 'N' WHERE idsite = '" + site + "'";
	con.query(update_query, function (error, results, fields) {
		if (error) throw error; 
		console.log('Se eliminó la configuracion de CS con éxito.');
	});	
	closeDB();
	setTimeout((function() {res.send(200, 'El sitio fue editado con éxito.');}), 3000);	  		
}

// Función para activar Pago en Dos Pasos en un sitio
function setDosPasos(req, res, next) {
	connectDB();
	site = req.params.site;
	medio_de_pago = req.params.medio_de_pago;
	var update_query = "UPDATE spsmedpagotienda SET autorizaendospasos = 'S' WHERE idsite = '" + site + "' AND idmediopago = '" + medio_de_pago + "'";
	con.query(update_query, function (error, results, fields) {
		if (error) throw error; 
		console.log('Configurada la Autorizacion en dos Pasos.');
	});	
	closeDB();
	setTimeout((function() {res.send(200, 'El sitio fue editado con éxito.');}), 3000);	  		
}

// Función para desactivar Pago en Dos Pasos en un sitio
function unsetDosPasos(req, res, next) {
	connectDB();
	site = req.params.site;
	medio_de_pago = req.params.medio_de_pago;
	var update_query = "UPDATE spsmedpagotienda SET autorizaendospasos = 'N' WHERE idsite = '" + site + "' AND idmediopago = '" + medio_de_pago + "'";
	con.query(update_query, function (error, results, fields) {
		if (error) throw error; 
		console.log('Se quitó la configuración de Autorización en dos Pasos.');
	});	
	closeDB();
	setTimeout((function() {res.send(200, 'El sitio fue editado con éxito.');}), 3000);	  		
}

// Función para insertar el subsite en la tabla
function insertSubsite(req, res, next) {
	connectDB();
	var date_time = getDateTime();
	site = req.params.site;
	subsites_list_raw = req.params.subsites;
	var subsites_list = subsites_list_raw.split(',');	
	for(i = 0; i < subsites_list.length; i++) {
// Primero elimina los subsites repetidos para que no se acumulen	
		var delete_query = "DELETE FROM spssites_subsites WHERE idsite = '" + site + "' AND idsubsite = '" + subsites_list[i] + "'";
		con.query(delete_query, function (error, results, fields) {
	  		if (error) throw error;
	  		console.log('El subsite fue eliminado.');
		});			
// Ahora sí, inserta los subsites requeridos
		var insert_query = "INSERT INTO spssites_subsites VALUES ('" + site + "', '" + subsites_list[i] + "', 0, 'S','" + date_time + "', NULL)";
		con.query(insert_query, function (error, results, fields) {
	  		if (error) throw error; 
			console.log('Se insertó el subsite con exito.');	  		
		});
	}
// Actualiza el site para que permita transacciones distribuidas
	var update_query = "UPDATE spssites SET transaccionesdistribuidas = 'S' WHERE idsite = '" + site + "'";
	con.query(update_query, function (error, results, fields) {
		if (error) throw error; 
		console.log('Se configuro el pago Distribuido.');
	});	
	closeDB();
	setTimeout((function() {res.send(200, 'Todos los subsitios fueron insertados con exito.');}), 3000);
}

// Función para remover los subsites de la tabla
function deleteSubsite(req, res, next) {
	connectDB();
	site = req.params.site;
// Si se indican subsites, se borran esos subsites. Sino, se borran todos.	
	if (req.params.subsites) {	
		subsites_list_raw = req.params.subsites;
		var subsites_list = subsites_list_raw.split(',');
		for(i = 0; i < subsites_list.length; i++) {		
// Remueve los subsites de la tabla
			var delete_query = "DELETE FROM spssites_subsites WHERE idsite = '" + site + "' AND idsubsite = '" + subsites_list[i] + "'";
			con.query(delete_query, function (error, results, fields) {
	  			if (error) throw error;
	  			console.log('El subsite fue eliminado.');
			});
		}	
	} else {
		var delete_query = "DELETE FROM spssites_subsites WHERE idsite = '" + site + "'";
		con.query(delete_query, function (error, results, fields) {
	  		if (error) throw error;
	  		console.log('Todos los subsites fueron eliminados.');
		});
	}
	
// Actualiza el site para que NO permita transacciones distribuidas
	var update_query = "UPDATE spssites SET transaccionesdistribuidas = 'N' WHERE idsite = '" + site + "'";
	con.query(update_query, function (error, results, fields) {
		if (error) throw error; 
		console.log('Se eliminó la configuración de pago Distribuido.');
	});
	closeDB();	
	setTimeout((function() {res.send(200, 'Todos los subsitios fueron eliminados con exito.');}), 3000);	
}

// Función para configurar un site como el merchant de otro
function insertMerchant(req, res, next) {
	connectDB();
	site = req.params.site;
	merchant = req.params.merchant;			

// Inserta el merchant requerido en la tabla
	var select_query = "SELECT * FROM site_merchant WHERE site_id = '" + site + "' AND merchant_id = '" + merchant + "'";
		con.query(select_query, function (error, results, fields) {
		if (error) throw error;
		console.log(results);
		if (results[0] != null) {
			console.log('El merchant indicado ya existe.');
		} else {	
			var insert_query = "INSERT INTO site_merchant VALUES ('" + site + "', '" + merchant + "')";
			con.query(insert_query, function (error, results, fields) {
				if (error) throw error; 
				console.log('Se insertó el merchant con exito.');	  		
			});
		}   		
	closeDB();	
	});		
	setTimeout((function() {res.send(200, 'El merchant fue insertado con exito o ya existía en la tabla.');}), 3000);
}


// Función para desconfigurar un site como el merchant de otro
function deleteMerchant(req, res, next) {
	connectDB();
	site = req.params.site;
	merchant = req.params.merchant;

// Busca la relación site-merchant en la tabla y la elimina	

	var delete_query = "DELETE FROM site_merchant WHERE site_id = '" + site + "' AND merchant_id = '" + merchant + "'";
	con.query(delete_query, function (error, results, fields) {
	  	if (error) throw error;
	  	console.log('El merchant fue eliminado con exito.');
	});
	
	closeDB();	
	setTimeout((function() {res.send(200, 'El merchant fue eliminado con exito.');}), 3000);	
}

// Función para comprobar si una operación fue insertada en la base con éxito a través del charge id

function checkDB(req, res, next) {
	connectDB();
	site = req.params.site;
    charge_id = req.params.charge_id;		

// Chequea si existe
	var select_query = "SELECT * FROM (SELECT spstransac.idsite, transaccion_operacion_xref.charge_id FROM spstransac INNER JOIN transaccion_operacion_xref ON spstransac.idtransaccion=transaccion_operacion_xref.transaccion_id) AS s WHERE s.idsite = '" + site + "' AND s.charge_id = " + charge_id + "";
		con.query(select_query, function (error, results, fields) {
		if (error) throw error;
		console.log(results);
		// Si la consulta no vino vacia...		
		if (results[0] != null) {
			console.log('Se encontraron ' + results.length + ' resultados en la base de datos.');
			setTimeout((function() {res.send(200, 'Chequeo de DB exitoso.');}), 3000);
		// Si en cambio, la consulta vino vacia...
		} else {	
			console.log('No existe ninguna transacción con esos valores en la base de datos.');
			setTimeout((function() {res.send(404, 'No se encontraron transacciones con esos valores en la base de datos.');}), 3000);
		}   		
	closeDB();	
	});		
}


// Función para comprobar si una operación fue insertada en la base con éxito a través del transaction id
function checkDBbyTx(req, res, next) {
	connectDB();
	site = req.params.site;
    operation_id = req.params.operation_id;		

// Chequea si existe
	var select_query = "SELECT * FROM (SELECT spstransac.idsite, transaccion_operacion_xref.operation_id FROM spstransac INNER JOIN transaccion_operacion_xref ON spstransac.idtransaccion=transaccion_operacion_xref.transaccion_id) AS s WHERE s.idsite = '" + site + "' AND s.operation_id = " + operation_id + "";
		console.log(select_query);
		con.query(select_query, function (error, results, fields) {
		if (error) throw error;
		console.log(results);
		// Si la consulta no vino vacia...		
		if (results[0] != null) {
			console.log('Se encontraron ' + results.length + ' resultados en la base de datos.');
			setTimeout((function() {res.send(200, 'Chequeo de DB exitoso.');}), 3000);
		// Si en cambio, la consulta vino vacia...
		} else {	
			console.log('No existe ninguna transacción con esos valores en la base de datos.');
			setTimeout((function() {res.send(404, 'No se encontraron transacciones con esos valores en la base de datos.');}), 3000);
		}   		
	closeDB();	
	});		
}

// Función para chequear si los valores ingresados en Redis coinciden con los ingresados en la base de datos
function checkRedis(req, res, next) {
	connectDB();
	site = req.params.site;
	get_redis_value = client.get(req.params.key, function(err, redis_value) {
		console.log('redis_value = ', redis_value);

		// Si el valor de Redis requerido existe...	
		if (redis_value) { 			
			// Obtiene el valor de la base..
			var select_query = "SELECT " + req.params.row + " FROM " + req.params.table + " order by " + req.params.row + " desc limit 1;";
				con.query(select_query, function (error, results, fields) {
				if (error) throw error;
				// Si la consulta no vino vacia...		
				if (results[0] != null) {
					console.log('valor en DB = ', results[0][req.params.row]);
					// Si el valor coincide...				
					if (results[0][req.params.row] == redis_value) {			
						console.log('El valor de ' + req.params.key + ' está correctamente configurado en Redis.');
						closeDB(); 
						setTimeout((function() {res.send(200, 'Chequeo de ' + req.params.key + ' exitoso.');}), 3000);
					// Si el valor no coincide...				
					} else {
						console.log('El valor de ' + req.params.key + ' no está correctamente configurado en Redis.');
						closeDB(); 
						setTimeout((function() {res.send(404, 'Chequeo de ' + req.params.key + ' no exitoso. El valor configurado en Redis (' + redis_value + ') no se corresponde con el mayor valor en la base (' + results[0][req.params.row] + ').');}), 3000);
					}
				// Si en cambio, la consulta vino vacia...		
				} else {	
					console.log('No se encontró el valor requerido en la base de datos.');
					closeDB(); 
					setTimeout((function() {res.send(404, 'No se encontró el valor requerido en la base de datos.');}), 3000);
				}   			
			});		
		} else {
			closeDB(); 
			setTimeout((function() {res.send(404, 'No se encontró la key solicitada de Redis.');}), 3000);
		};

	});       	
}

// Función para generar veps.
function vepGenerator(req, res, next) {
	var vep = { "payment":{ "amount":"30000", "currency":"ARS", "installments":1 }, "ticket_payment":{ "cuit":{ "authorizing":"20240215455", "taxpayer":"20240215455", "user":"20240215455", "owner":"20240215455" }, "cp":{ "payment_entity":"1002", "payer_bank":"389", "payment_format":1, "branch_office_type":8 }, "vep":{ "number":"000292454419", "advance_fee":"0", "fiscal_period":"201703", "concept":"19", "sub_concept":"19", "establishment":"0", "payment_description_extract":"MONOTR03/17", "payment_description":"Monotributo - Pago Mensual - Personas Fisicas", "payment_type":"1", "form":"152", "expiration_date":"2017-12-07 18:42:00", "creation_date":"2017-12-07 18:42:00", "due_date":"2017-12-07 18:42:00", "collecting_agency":"organismo recaudador", "description_concept":"sub con", "subconcept_description":"subconcept description", "owner_transaction_id":"asdf", "field_escription":"field_escription", "content_description":"content_description", "tax_description":"Tax description", "taxes":[ { "id":20, "amount":368 }, { "id":21, "amount":399.3 }, { "id":24, "amount":419 } ], "content":"1502021", "field_id":"3", "field_type":"N" } } };
	res.send(200, vep);
}

// Función para activar el uso de URL dinámica: vacía el valor del campo "urlpost". 
// La tx debe incluir el campo "URLDINAMICA" ya que no lo establece el comercio. Se debe enviar el modo de PPB con el campo "mode".
function setURLDinamica(req, res, next) {
	connectDB();
	site = req.params.site;
	mode = req.params.mode;
	var update_query = "UPDATE spssites SET usaurldinamica = 'S', urlpost = '', reciberesuonline= '"+mode+"' WHERE idsite = '" + site + "'";
	con.query(update_query, function (error, results, fields) {
		if (error) throw error; 
		console.log('URLDinamica activada.');
	});	
	closeDB();
	setTimeout((function() {res.send(200, 'El sitio fue editado con éxito.');}), 3000);	  		
}

// Función para desactivar el uso de URL dinámica. Se debe enviar un URLDINÁMICA que utilizarán todas las txs realizadas en este comercio, y enviar el modo de PPB con el campo "mode".
function unsetURLDinamica(req, res, next) {
	connectDB();
	site = req.params.site;
	url = req.params.url;
	mode = req.params.mode;
	var update_query = "UPDATE spssites SET usaurldinamica = 'N', urlpost = '"+url+"', reciberesuonline= '"+mode+"' WHERE idsite = '" + site + "'";
	con.query(update_query, function (error, results, fields) {
		if (error) throw error; 
		console.log('URLDinamica desactivada');
	});	
	closeDB();
	setTimeout((function() {res.send(200, 'El sitio fue editado con éxito.');}), 3000);	  		
}

var server = restify.createServer();

server.use(restify.bodyParser());

server.post('/sites/subsites', insertSubsite);
server.post('/sites/merchant', insertMerchant);
server.post('/sites/reutilizacion', setReutilizacion);
server.post('/sites/agregador', setAgregador);
server.post('/sites/tokenization', setTokenization);
server.post('/sites/cs', setCS);
server.post('/sites/dospasos', setDosPasos);
server.post('/sites/porcentaje', setPorcentaje);
server.post('/sites/porcentajeSinConsiderarSitioPadre', setPorcentajeWithoutFatherSitePercentage);
server.post('/sites/mpos', setMPOS);
server.post('/sites/urldinamica', setURLDinamica);

server.post('/tests/db', checkDB);
server.post('/tests/dbtx', checkDBbyTx);
server.post('/tests/redis', checkRedis);

server.del('/sites/subsites', deleteSubsite);
server.del('/sites/merchant', deleteMerchant);
server.del('/sites/cs', unsetCS);
server.del('/sites/reutilizacion', unsetReutilizacion);
server.del('/sites/agregador', unsetAgregador);
server.del('/sites/tokenization', unsetTokenization);
server.del('/sites/dospasos', unsetDosPasos);
server.del('/sites/porcentaje', unsetPorcentaje);
server.del('/sites/mpos', unsetMPOS);
server.del('/sites/urldinamica', unsetURLDinamica);

// Ruta para reportar el último error via HTTP
server.get('/healthcheck', version);
server.get('/vep/:vepNumber', vepGenerator);

server.listen('8080', function() {
	console.log('%s listening at %s', server.name, server.url);
});
