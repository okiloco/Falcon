const express =require('express');
var http = require("https");
var md5 = require("md5");
var fs = require("fs");
var path = require("path");
var url = require("url");
var req = require('request')
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
var Helper = require("./helpers/helper");

const corsOptions = {
	origin:'http://localhost:3000'
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
    res.setHeader('Access-Control-Allow-Credentials', true);

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
	config["port"] = port;
	
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
			// config["user"] = global.user;
			socket.emit("start",{
				"success":(!Helper.isEmpty(config)),
				"config":config
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
		//app.use("/app",session_middleware);
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