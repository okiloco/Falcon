const express =require('express');
var md5 = require("md5");
var fs = require("fs");
var path = require("path");
/*var Model = require("./models/Model");
const db = new Model({
	dbname:'falcon-db'
}); */
var bodyParser = require("body-parser");
var session = require("express-session");
var routes = require("./routes");
var session_middleware = require("./middlewares/session");
var app = express();
var events = require('events');//Events administra eventos

var Helper = require("./helpers/helper");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;


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

app.get("/seting",function(req,res){

	send("vea")

});

app.get("/refresh",function(req,res){
	db.refresh(function(err,schema){
		res.send("Aplicaión actualizada.");
	});
});



app.use("/public",express.static("public"));
app.use("/config",express.static("config"));
app.use("/controllers",express.static("controllers"));
// app.use("/app",session_middleware);
app.use("/app",routes(app,db));

var port = process.env.PORT || 3000;
db.connect((err,schema)=>{
	app.listen(port,function(){
		//Cargar Controladores 
		var dir = './server/controllers';
		fs.readdirSync(dir).forEach(function(file){
			route = require('./controllers/'+file);
			var name = path.parse(file).name.toLowerCase();;
			var controllerName=Helper.capitalize(name);

			var controller = new route.controller(name,app,db);
			// controller.prototype = new events.EventEmitter;		
		});
		//Define los Esquemas de la base de datos
		db.define();
	  	console.log("Arranco el Server localhost:"+port);
    });
});

