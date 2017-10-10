const express =require('express');
var md5 = require("md5");
var fs = require("fs");
var path = require("path");
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
var Helper = require("./helpers/helper");
module.exports = function(config){

	var port = process.env.PORT || 3000;
	// config["port"] = port;
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
	function init(){
		io.on("connect",function(socket){
			console.log("socket connected.");
			socket.emit("start",config);
		});
	}

	console.log("Iniciando Aplicación",config);
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