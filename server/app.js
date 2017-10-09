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
app.use("/config",express.static("config"));
// app.use("/routes",express.static("routes"));
// app.use("/app",session_middleware);
// app.use("/app",routes(app,db));
var routes = require("./routes");
app.use("/app",routes(app,db));
var port = process.env.PORT || 3000;
db.connect()
.then(function(){
	
	server.listen(port,function(){
		//Cargar routes de aplicación
  		console.log("Arranco el Server localhost:"+port);
    });
});

