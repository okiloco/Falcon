
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

var Helper = require("./helpers/helper");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

//Sockets
io.on("connect",function(socket){
	console.log("socket connected.");
	socket.emit("messages",{
		id:1,
		text:"Hola",
		author:"fvargas"
	});
});

//Middlewares
app.use(bodyParser.json());//para peticiones aplication/json
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
	secret:"8e52fe2a97340624bfd3e93caf3409bf",
	resave:false,
	saveUninitialized:false
}));

//Crear Instancia de Objeto Administrador de base de datos
const ManagerDB = require("./database/ManagerDB");
const db = ManagerDB.createManagerDB();

app.use("/public",express.static("public"));
app.use("/app",session_middleware);
var routes = require("./routes");
app.use("/app",routes(app,db));


var app_config = './server/app.json';
function loadConfig(callback){
	Helper.readFile(app_config)
	.then(function(obj){
		Helper.writeFile(app_config,obj);
		if(callback!=undefined){
			callback(obj);
		}
	});
}

var port = process.env.PORT || 3000;
server.listen(port,function(){
	db.connect()
	.then(function(msg){
		loadConfig(function(obj){
			console.log("msg",msg);
		});	
	},function(err){
		console.log(err)
	});
});

