const express =require('express');
var http = require("https");
var md5 = require("md5");
var fs = require("fs");
var path = require("path");
var url = require("url");
var pem = require('pem');
var cors = require('cors')
var moment = require('moment-timezone');
const ElectronOnline = require('electron-online')
const connection = new ElectronOnline();

var bodyParser = require("body-parser");
var session = require("express-session");
var session_middleware = require("./middlewares/session");
var online_middleware = require("./middlewares/online");
var online = false;
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var events = require('events');//Events administra eventos
const mongoose = require("mongoose");
const ManagerDB = require("./database/ManagerDB");
mongoose.Promise = global.Promise;
var Helper = require("./helpers/helper.js");
var Constants = require("./helpers/Constants.js");
var request = require('request');
var formData = require('form-data');
var socket;
var db;
var initialized = false;
const corsOptions = {
	origin:Constants.URL_BASE
}
app.use(cors(corsOptions))

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', false);

    // Pass to next layer of middleware
    next();
});

app.get("/config",function(req,res){
	Helper.readFile('./server/app.json').
	then(function(config){
		res.send({
			"success":(!Helper.isEmpty(config)),
			config
		});
	},function(err){
		res.send({
			"success":false
		});
	});
});

module.exports = function(config){

	var port = process.env.PORT || 3000;
	global.config = config;

	function actualizarInfraccion(params){
		db.infraccion.find({"_id":params.id})
		.then(function(docs){
			var infraccion = docs[0];
			infraccion.estado=1;
			infraccion.save(function(err,doc){
				if(err){
					socket.emit("infraccion-error",err);
				}else{
					socket.emit("infraccion-update",doc);
				}
			});
		});
	}
	function subirArchivos(params){
		// var socket = global.scoket;
		var formData = {
			"urlVideos":params.urlVideos,
			"urlImages":params.urlImages,
			"lote":params.lote,
			"codigo":params.codigo,
			"direccion":params.direccion,
			"dispositivo":params.dispositivo,
			"estado":params.estado,
			"fecha":params.fecha,
			"lat":params.lat,
			"long":params.long,
			"lote":params.lote,
			"placa":params.placa,
			"userfile[]":[]
		};
		var files  = params.urls;
		var userfiles =[];
		
		return new Promise(function(resolve,reject){

			if(connection.status=='OFFLINE'){
				reject("No hay conexión a Internet.");
				return;
			}
			if((params.estado!=1)){
				reject("La infracción se subirá más tarde.");
				return;	
			}

			
			console.log("subir: ",params.estado,(params.estado==1));
			console.log("Se va a subir los Archivos.");
			

			/*socket.emit("uploaded",null,params);
			//Actualizar Infracción.
			actualizarInfraccion(params);
			resolve(params);
			return;	*/

			files.forEach(function(file){
				var url = file.url;
				try{
					if(url!=undefined){
						userfiles.push(fs.createReadStream(url));
					}
				}catch(err){
					console.log("[Error al leer archivos]",url,"Error:",err);
					reject(err);
					return;					
				}
			});

			if(userfiles.length>0){
				
				formData["userfile[]"] = userfiles;

				console.log("Fecha: ",params.fecha)
				formData["fecha"] = moment().tz(params.fecha.toString(),"America/Bogota").format('YYYY-MM-DD HH:mm:ss');
				
				request.post({
				"url":Constants.URL_SUBIR_ARCHIVOS_BACKOFFICE, 
				formData: formData},
				function(err, httpResponse, body) { 

					
					console.log("response::",body);
					if(body!=undefined){

					var response = JSON.parse(body);
					console.log("response:: ",response.success);
					if (err) {
						console.log("[Error al enviar archivos]",err);
					   	reject("Error al enviar archivos "+err);
					   	return;
					}
					if(!response.success){
					   	reject(response.msg);
					   	return;
				    }
					socket.emit("uploaded",null,params);
					//Actualizar Infracción.
					console.log("Antes de actualizar la infraccion:",params);
					actualizarInfraccion(params);
					resolve(params);
				}else{
					reject("Revise la conexión a Internet.");
				}
				});
			}else{
				console.log("No se pudo subir la infracción: "+params._id+"<br>Puede que los archivos no existan.");
			}
		});
	};


	function getOnline(){
		return online;
	}
	function transferFiles(params){

		var socket = global.socket;
		return new Promise(function(resolve,reject){

			var sync = global.sync || false;
			console.log("Sync: ",sync);
			if(connection.status=='ONLINE'){
				if(!("length" in params)){
					subirArchivos(params)
					.then(function(doc){
						console.log("Todo bien todo bien!");
						resolve();
					}, function(err){
						console.log(err)
						socket.emit("upload-fail",err);
					});
				}else{

					if(sync){
						params.forEach(function(doc,index,arr){

							var total = (arr.length - 1);
							console.log("\t-->index:",index,total);

							db.infraccion.listar({"_id":doc._id},function(docs){
								
								var infraccion = docs[0];
								infraccion.estado = 1;
								// infraccion["urls"] = infraccion.videos.concat(infraccion.images);

								subirArchivos(infraccion)
								.then(function(doc){
									console.log("Todo bien todo bien!");
									if(index == total){
										resolve();
									}
								}, function(err){
									console.log(err)
									socket.emit("upload-fail",err);
								});

							});
						});
					}else{
						reject("Las infracciones se cargaran en otro momento.");
					}
				}
			}else{
				reject("No se pudo subir la(s) Infraccion(es)<br>Revise su conexión a Internet.");
			}
			
		});
	}
	function init(){
		io.once("connect",function(_socket){

			if(!initialized){
				config["port"] = port;
				
				socket = _socket;
				global.socket = socket;
				
				socket.emit("start",{
					"success":(!Helper.isEmpty(config)),
					"config":config,
					"user":global.user
				});
				socket.on("new-infraccion",function(params){
					console.log("Nueva Infracción recibida.");

					transferFiles(params)
					.then(function(){
						console.log("Tranferencia exitosa.");
						socket.emit("message","Tranferencia exitosa.");
					},function(err){
						socket.emit("message",err);
						console.log(err);
					});
				});
				socket.on("onsync",function(sync){
					console.log("Sync: ",sync);
					global.sync = sync;
					if(sync){
						db.infraccion.find({"estado":0},function(err,docs){

							if(docs.length>0){
								transferFiles(docs)
								.then(function(){
									console.log("Tranferencia exitosa.");
									socket.emit("message","Tranferencia exitosa.");
								},function(err){
									console.log(err);
									socket.emit("message",err);
								});
							}
						});
					}
				});	

				var online = (connection.status=='ONLINE');
				connection.on("online",function(msg){
					if(!online){
						console.log("Aplicación en linea.",connection.status);
						socket.emit("online","Aplicación en linea.",connection.status);
						online = true;
					}
				});
				connection.on("offline",function(msg){
					if(online){
						console.log("Aplicación sin conexión.",connection.status);
						socket.emit("offline","Aplicación sin conexión.",connection.status);
						online = false;
					}
				});
				initialized =true;
				console.log("socket connected.",new Date().toLocaleString());
			}
		});
	}

	console.log("Iniciando Aplicación");
	return new Promise(function(resolve,reject){
		//Sockets
		
		//Middlewares
		app.use(bodyParser.json());//para peticiones aplication/json
		app.use(bodyParser.urlencoded({extended:true}));
		app.use(session({
			secret:"c20d8281f15f26ab809c4736ac1eda7b",
			resave:false,
			saveUninitialized:false
		}));
		//Crear Instancia de Objeto Administrador de base de datos
		db = ManagerDB.createManagerDB();

		app.use("/public",express.static("public"));
		app.use("/app",session_middleware);
		// app.use("/app",online_middleware);
		var routes = require("./routes");
		app.use("/app",routes(app,db));
		app.use(function(req, res, next) {
		  res.header("Access-Control-Allow-Origin", "*");
		  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		  next();
		});
		
		server.listen(port,function(){
			db.connect()
			.then(function(msg){
				//iniciar utilidades de aplicación
				if(Helper.isEmpty(config)){
					reject();
				}else{
					init();
					resolve(config);
				}
			},function(err){
				reject(err);
			});
		});
	});
}