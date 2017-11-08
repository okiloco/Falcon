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
var events = require('events');//Events administra eventos
const mongoose = require("mongoose");
const ManagerDB = require("./database/ManagerDB");
mongoose.Promise = global.Promise;
var Helper = require("./helpers/helper.js");
var Constants = require("./helpers/Constants.js");
var request = require('request');
var formData = require('form-data');

const app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var socket,db,initialized = false;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
module.exports = function(config){
	
	global.config = config;
	
	io.on("connect",function(socket){
		if(!initialized){
			
			//set global Socket
			global.socket = socket;
			
			socket.emit("start",{
				"success":(!Helper.isEmpty(config)),
				"config":config,
				"user":global.user
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

	console.log("Iniciando Aplicación");
	return new Promise(function(resolve,reject){
		
		app.use(bodyParser.json());//para peticiones aplication/json
		app.use(bodyParser.urlencoded({extended:true}));
		app.use(session({
			secret:"c20d8281f15f26ab809c4736ac1eda7b",
			resave:false,
			saveUninitialized:false
		}));

		//Crear Instancia de Objeto Administrador de base de datos
		db = ManagerDB.createManagerDB();

		//Middlewares
		app.use("/public",express.static(path.join(global.APP_PATH,"public")));
		app.use("/app",session_middleware);
		var routes = require("./routes");
		app.use("/app",routes(app,db,io));
		
		//Arrancar Servidor
		var port = process.env.PORT || 3000;
		server.listen(port,function(){
			
			db.connect()
			.then(function(msg){
				resolve(msg);
			},function(err){
				reject(err);
			});
		});
	});
}