const express =require('express');
var http = require("https");
var md5 = require("md5");
var fs = require("fs");
var path = require("path");
var url = require("url");
var pem = require('pem');
var cors = require('cors')

var bodyParser = require("body-parser");
var session = require("express-session");
var session_middleware = require("./middlewares/session");
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
app.get("/organismos",function(req,res){

	var options = {
		"method":'GET',
		"url":Constants.URL_ORGANISMOS
	};
	request(options,function(err,response,body){
		var result = response;
		console.log("BODY:::",body);
		if (err) {
			console.log("[Error al enviar archivos]",err);
		   	return;
		}
		res.send(JSON.stringify({
			"data":JSON.parse(body)
		}));
	});
});
app.get("/dispositivos",function(req,res){

	var params = req.query;
	var options = {
		"method":'GET',
		"url":Constants.URL_DISPOSITIVOS,
		"qs":params
	};
	request(options,function(err,response,body){
		var result = response;
		console.log("GET BODY:::",body);
		if (err) {
			console.log("[Error al enviar archivos]",err);
		   	return;
		}
		res.send(JSON.stringify({
			"data":JSON.parse(body)
		}));
	});
});


module.exports = function(config){

	var port = process.env.PORT || 3000;
	
	
	/*obj["user"] = {
		"username":params.username,
		"email":params.email || ''
	}
	obj["camera"] ={
		"camera_ip":params.camera_ip,
		"camera_user":params.camera_user,
		"camera_password":params.camera_password
	}
	obj["movil"] ={
		"movil_plate":params.movil_plate,
		"movil_name":params.movil_name
	}*/
	global.config = config;

	function subirArchivos(params){
		var socket = global.scoket;
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

		console.log(params.urlVideos,params.urlImages);
		return new Promise(function(resolve,reject){

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
			formData["userfile[]"] = userfiles;
			request.post({
			"url":Constants.URL_SUBIR_ARCHIVOS_BACKOFFICE, 
			formData: formData},
			function(err, httpResponse, body) { 

				if (err) {
					console.log("[Error al enviar archivos]",err);
				   	reject("Error al enviar archivos "+err);
				   	return;
				}
				resolve(formData);
			});
		});
	};

	function init(){
		io.on("connect",function(socket){
			config["port"] = port;
			console.log("socket connected.");
			// config["user"] = global.user;
			global.socket = socket;

			socket.emit("start",{
				"success":(!Helper.isEmpty(config)),
				"config":config,
				"user":global.user
			});
			socket.on("new-infraccion",function(params){
				console.log("Nueva Infracción recibida.",params);
				subirArchivos(params)
				.then(function(doc){
					console.log("Todo bien todo bien!")
					socket.emit("uploaded",null,doc);
				}, function(err){
					console.log("[ERROR] Algo salió mal.",err)
					socket.emit("upload-fail",err);
				});
			});
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
		
		const db = ManagerDB.createManagerDB();

		app.use("/public",express.static("public"));
		app.use("/app",session_middleware);
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