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
			console.log("Se va a subir los Archivos.");
			files.forEach(function(file){
				var url = file.url;
				try{
					userfiles.push(fs.createReadStream(url));
				}catch(err){
					console.log("[Error al leer archivos]",url,"Error:",err);
					reject(err);
					return;					
				}
			});

			formData["fecha"] = moment().tz(params.fecha,"America/Bogota").format();

			formData["userfile[]"] = userfiles;
			request.post({
			"url":Constants.URL_SUBIR_ARCHIVOS_BACKOFFICE, 
			formData: formData},
			function(err, httpResponse, body) { 
				console.log("BODY:",body);
				if (err) {
					console.log("[Error al enviar archivos]",err);
				   	reject("Error al enviar archivos "+err);
				   	return;
				}
				resolve(params);
			});
		});
	};


	function getOnline(){
		return online;
	}
	function init(){

		if(!initialized){
			io.on("connect",function(_socket){
				config["port"] = port;
				console.log("socket connected.");
				global.socket = socket;
				
				socket = _socket;
				
				socket.emit("start",{
					"success":(!Helper.isEmpty(config)),
					"config":config,
					"user":global.user
				});
				socket.on("new-infraccion",function(params){
					console.log("Nueva Infracción recibida.",params);
					subirArchivos(params)
					.then(function(doc){
						console.log("Todo bien todo bien!");
						socket.emit("uploaded",null,doc);
						//Actualizar Infracción.
						actualizarInfraccion(doc);
					}, function(err){
						console.log(err)
						socket.emit("upload-fail",err);
					});
				});
				
			});
			
			connection.on("online",function(msg){
				console.log("Aplicación en linea.")
				socket.emit("online","Aplicación en linea.");
			});
			connection.on("offline",function(msg){
				console.log("Aplicación sin conexión.")
				socket.emit("offline","Aplicación sin conexión.");
			});
			
			console.log("Aplicación Iniciada.",new Date().toLocaleString());
			initialized =true;
		}
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