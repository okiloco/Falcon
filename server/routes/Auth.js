var md5 = require("md5");
module.exports = function(app,io,db){
	//Evento Constructor User - Se dispara cuando el Schema user ha sido instanciado.
	db.on("user",function(schema){
		//Extendemos la funcionalidad del Schema para usar en el Modelo User.
		schema.statics.login = function(params){

			var self = this;
			return new Promise(function(resolve,reject){
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

						req.session.user_id =user._id;
						res.locals.user = user;
						
						res.send(JSON.stringify({
							"user":user,
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
					"msg":"Acceda como Super Administrador al Sistema.",
				}));
			}
		});
	});
}