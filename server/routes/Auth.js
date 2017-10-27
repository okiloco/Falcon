var md5 = require("md5");
var Helper = require("../helpers/helper");
var app_config = './server/app.json';
//const service = require("../services/index");
module.exports = function(app,io,db){
	//Evento Constructor User - Se dispara cuando el Schema user ha sido instanciado.
	db.on("user",function(schema){
		//Extendemos la funcionalidad del Schema para usar en el Modelo User.
		schema.statics.login = function(params){

			var self = this;
			return new Promise(function(resolve,reject){
				 
				 var result={};
				 self.findOne(params)
				.populate('usergroup')
				.select('username email usergroup modules')
				.cursor()
				.eachAsync(function(user) {
					//Si hay datos entra a recorrer
			        user.usergroup.modules.forEach(function(docs,index,arr){
			        	db.module.findOne(docs.module,(err,doc)=>{
			        		user.usergroup.modules[index]=doc;
			        	});
			        });
					//user.usergroup.modules=modules;
			        resolve(user);
		      	})
				.then(function(data){
					reject("Usuario y/o contraseña invalidos.");
				});
			});
		}
		schema.on("define",function(model){

			app.get("/logout",function(req,res){
				if(req.session.user_id){
					req.session.destroy(function(err){
						if(err) res.send(err);
						res.send(JSON.stringify({
							success:true,
							msg:"Session finalizada."
						}));
					});
				}else{
					res.send(JSON.stringify({
						success:false,
						msg:"No existe sisión de usaurio."
					}));
				}
			});
			app.get("/login",function(req,res){
				var params = req.query;
				if(!db.user){
					res.send(JSON.stringify({
						success:false,
						msg:'No se ha creado el esquema user <br>Contacte con el administrador.'
					}));
				}else{
					//Llamar funcion login del Modelo user
					db.user.login({"username":params.username,"password":md5(params.password)})
					.then(function(user){

						//console.log(req.session.secret);
						//var token = service(user,req.session.secret);
						req.session.user_id =user._id;
						res.locals.user = user;

						global.user = user;
						
						res.send(JSON.stringify({
							"user":user,
							// "token":token,
							"success":true
						}));
					}).catch((err)=>{
			            res.send(JSON.stringify({"msg":err,"success":false}));
			        });
				};
			});
			
		});
	});
	app.post("/install",function(req,res){
		var params = req.body;
		function install(params){
			return new Promise(function(resolve,reject){
				console.log("Crear usuario Super User");
				if(!params.password || !params.username){
					res.send(JSON.stringify({
						"success":false,
						"msg":"No se definió un usuario."
					}));
					return;
				};
				db.group.findOne({name:"Super User"},function(err,doc){
					if(!doc){
						console.log("No existe el grupo.")
						db.module.create({
							config:"{\"title\": \"Usuarios\",\"config\": {\"className\":\"Admin.view.users.Users\",\"alias\":\"users\",\"iconCls\":\"fa fa-folder\"}}",
							name:"Usuarios"
						},function(module){
							db.group.create({
								name:"Super User",
								modules:module.id
							},function(group){
								db.user.create({
									"username":params.username,
									"password":md5(params.password),
									"usergroup":group.id,
									"email":params.email || ''
								},function(user){

									var obj = {};
									obj["user"] = {
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
									}
									delete params.password;
									delete params.email;
									delete params.username;
									for(var key in params){
										obj[key] = params[key];
									}
									Helper.writeFile(app_config,obj,{spaces: 2, EOL: '\r\n'},function(err){
										console.log("Archivo de configuración creado.")
									},function(){
										console.log("No se pudo crear el archivo de configuración")
									});
									res.send(JSON.stringify({
										"success":true,
										"msg":"Usuario creado con éxito.",
										user
									}));
								});
							});
						});
					}else{
						res.send(JSON.stringify({
							"success":true,
							"msg":"Puede que el Sistema ya está instalado<br>Inicar Sesión como Super Administrador.",
						}));
					}
				});
			});
		}

		install(params)
		.then(function(){
			console.log("Instalación completada.")
		});
	});
	app.post("/config",function(req,res){

		var params = req.body;

		Helper.readFile('./server/app.json').
		then(function(config){

			for(var key in config){
				if(typeof(config[key])=='object'){
					for(var s in config[key]){
						config[key][s] = params[s];
					}
				}else{
					config[key]=params[key];
				}
			}
			Helper.writeFile('./server/app.json',config).
			then(function(config){
				res.send({
					"success":true,
					"msg":"Configuración Actualizada.<br>Se debe cerrar la sesión e iniciar nuevamente, para reflejar los cambios.",
					config
				});
			},function(err){
				res.send({
					"success":false
				});
			});

		});
	});
}