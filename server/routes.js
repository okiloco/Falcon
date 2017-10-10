/**
* @routes: app,db
* Carga los middlewares de la aplicación 
* Crea Rutas dinamicas para acceder a las funciones CRUD
* de modelos de manera Simple.
* Si desea agregar nueva funcionalidad, debe sobre escribir las rutas
* o crear rutas personalizadas en el directorio /routes para rutas publicas
* o en /routes/app para rotas privadas de la aplicación.
* Los esquemas estan disponibles en el evento on("NOMBRE_SCHEMA",callback);
* ...................................................................
* NOTA: Si el nombre del archivo no corresponde con
* un nombre de schema válido, el valor del atributo de entrada "schema"
* será indefinido. Queda a disposición del desarrollador utilizar el objeto db
* para escuchar los eventos y especificar con que esquema trabajará.
* Eventos Disponibles:
+ db.on("NOMBRE_MODELO",(schema))
+ schema.on("define",(model))
+ db.on("define",(name,model))
* ver la definición de las rutas publicas y privadas en este script.
* keyword: (Instanciar ruta:)
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

module.exports = function(app,db,io){
	
	const public_routes ='./server/routes';
	const app_routes = './server/routes/app';
	var routes_map = {};
	
	/**
	* @loadRoutes: base_path, prefix
	* Carga los archivos de las rutas especializadas.
	*/
	function loadRoutes(base_path,prefix){
		return new Promise(function(resolve,reject){
			prefix = prefix || '';
			console.log("ruta:::",base_path,prefix)
			function readFiles(base_path,prefix){
				fs.readdirSync(base_path).forEach(function(file){
					file = './routes'+prefix+'/'+file;
					var ext = path.extname(file);
					if(ext!=null && ext=='.js'){
						try{
							route = require(file);
							var name = path.parse(file).name.toLowerCase();
							var controllerName=Helper.capitalize(name);
							var schema;
							var route_name;
							
							if(prefix==''){
								console.log("Router public: ",name);
								//Instanciar ruta: publica
								route(app,io,db,schema);
							}else{
								/*Listener para cuando se cree el Schema con el nombre especifico.*/
								db.on(name,function(schema){
									route_name = pluralize(schema.lang || "es",name);
									route_name = prefix+"/"+route_name;
									/*
									* Instanciar ruta: privada: 
									* La aplicación empieza a usar el nuevo middlewares route.
									*/
									// console.log("route: ",name,route_name);
									app.use(route_name,route(app,router,db,schema));
								});
							}
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

	function routeExist(name){
		var paths = routes_map["paths"];
		var exist = false;
		paths.forEach(function(route){
			if(route.name==name){
				exist = true;
			}
		});
		return exist;
	}

	//Define Recursos dinamicos de router
	function routePath(route_map){
		var route_name = route_map.path;
		var name = route_map.name;
		list = function(req,res,next){
			var params = req.query || {};
			console.log(params);
			db[name].search(params,function(err,docs){
				console.log("GET: list "+route_name,docs);			
				res.send(JSON.stringify({data:docs}));
			});
		}
		update = function(req,res,next){
			res.send(JSON.stringify({"success":true,"msg":"update"}));
		}
		findById = function(req,res,next){
			res.send(JSON.stringify({"success":true,"msg":"findById"}));
		}
		save = function(req,res,next){
			var params = req.body;
			db[name].create(params,function(err,doc){
				console.log("GET: save "+route_name);
				if(!doc){
					res.send(JSON.stringify({"success":false,"msg":err}));
				}else{
					res.send(JSON.stringify({
						"success":true,
						"msg":(!params._id)?"Registro creado con éxito.":"Registro actualizado con éxito."
					}));
				}
			});
			console.log(router.route)
		}
		remove = function(req,res,next){
			db[name].removeById(req.params._id,function(msg,doc){
				console.log("GET: remove "+route_name);
				res.send(JSON.stringify({
					success:true,
					msg:msg
				}));
			});
		}
		console.log(">define route: ",name,"/app"+route_name);
		router.route(route_name).get(list);//Listar y Buscar
		router.route(route_name).post(save);//crear registro nuevo y actualizar
		router.route(route_name+':_id').get(findById);//busca un registro por Id
		router.route(route_name+'/delete/:_id').post(remove);//Eliminar registro por Id
	}
	/**
	* on:define name, schema
	* Crea rutas predeterminadas para
	* los modelos definidos.
	*/

	db.on("define",function(name,model){
		// var name = model.modelName;
		var schema = model.getSchema();
		var lang = schema.lang;
		var route_name = pluralize(lang || "es",name);
		route_name = path.join('/',route_name);
		routes_map["paths"] = routes_map["paths"] || [];
		if(!routeExist(name)){
			routes_map["paths"].push({"name":name,"path":route_name});
		}
	});
	db.on("ready",function(){
		console.log("Rutas dinámicas");
		routes_map["paths"].forEach(function(route_map){
			routePath(route_map)
		});
	});

	console.log("Cargando rutas...");
	//Cargar routes de aplicación
	loadRoutes(public_routes)
	.then(function(){
		console.log("rutas publicas cargadas.")
		loadRoutes(app_routes,"/app")
		.then(function(){
			console.log("routes privadas cargadas.");
		});
	});
	
	
	return router;
};