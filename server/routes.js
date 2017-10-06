/**
* @routes: app,db
* Carga los middlewares de la aplicación 
* 
* Acceder a las funciones CRUD de modelos de manera Simple.
* Se desea agregar nueva funcionalidad, debe sobre escribir las rutas
* o crear rutas personalizadas, los esquemas estan disponibles
* En el evento on("NOMBRE_SCHEMA",callback);
*/
var express = require("express");
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var router = express.Router();
var dateFormat = require('dateformat');
var streaming = require("./js/videoStreaming");
var pluralize = require("./helpers/helper").pluralize;
var md5 = require("md5");
var fs = require("fs");
var path = require("path");
var Helper = require("./helpers/helper");

module.exports = function(app,db){
	
	const public_routes ='./server/routes';
	const app_routes = './server/routes/app';
	
	/**
	* @loadRoutes: base_path, prefix
	* Carga los archivos de las rutas especializadas.
	*/
	function loadRoutes(base_path,prefix){
		return new Promise(function(resolve,reject){
			prefix = prefix || '';
			function readFiles(base_path,prefix){
				fs.readdirSync(base_path).forEach(function(file){
					file = './routes'+prefix+'/'+file;
					var ext = path.extname(file);
					if(ext!=null && ext=='.js'){
						try{
							route = require(file);
							var name = path.parse(file).name.toLowerCase();
							var controllerName=Helper.capitalize(name);
							/*Listener para cuando se cree el Schema con el nombre especifico.*/
							db.on(name,function(){
								var schema = db.getSchema(name);
								var lang = schema.lang;
								var route_name = pluralize(lang || "es",name);
								route_name = prefix+"/"+route_name;
								/*La aplicación empieza a usar el nuevo middlewares route.*/
								app.use(route_name,route(app,router,db,schema));
								console.log("~route: ",schema.name,route_name);
							});
						}catch(err){
							reject(err);
							console.log("No se pudo cargar: ",err);
						}
					}
				});
			}
			readFiles(base_path,prefix);
			resolve();
		});
	}
	/**
	* on:define name, schema
	* Crea rutas predeterminadas para
	* los modelos definidos.
	*/
	function defaultsRoutes(){
		db.on("define",function(model){
			var name = model.modelName;
			var schema = model.getSchema();
			var lang = schema.lang;
			var route_name = pluralize(lang || "es",name);
			route_name = path.join('/',route_name);

			list = function(req,res){
				var params = req.query || {};
				console.log(params);
				db[name].search(params,function(err,docs){
					console.log("GET: list "+route_name,docs);			
					res.send(JSON.stringify({data:docs}));
				});
			}
			update = function(req,res){
				res.send(JSON.stringify({"success":true,"msg":"update"}));
			}
			findById = function(req,res){
				res.send(JSON.stringify({"success":true,"msg":"findById"}));
			}
			save = function(req,res){
				var params = req.body;
				db[name].create(params,function(err,doc){
					console.log("GET: save "+route_name);
					if(!doc){
						res.send(JSON.stringify({"success":false,"msg":err}));
					}else{
						res.send(JSON.stringify({
							"success":true,
							"msg":(!params.id)?"Registro creado con éxito.":"Registro actualizado con éxito."
						}));
					}
				});
			}
			remove = function(req,res){
				db[name].removeById(req.params.id,function(msg,doc){
					console.log("GET: remove "+route_name);
					res.send(JSON.stringify({
						success:true,
						msg:msg
					}));
				});
			}
			db.on("ready",function(){
				//Recursos dinamicos de route
				console.log(">route: ",name,route_name);
				router.route(route_name).get(list);//Listar y Buscar
				router.route(route_name).post(save);//crear registro nuevo y actualizar
				router.route(route_name+':id').get(findById);//busca un registro por Id
				router.route(route_name+'/delete/:id').post(remove);//Eliminar registro por Id
			});
		});
	}
	//Cargar routes de aplicación
	loadRoutes(public_routes).then(function(){
		loadRoutes(app_routes,"/app").then(function(){
			console.log("routes ready.");
		});
		defaultsRoutes();
	});
	console.log("Init routes.")
	
	return router;
};