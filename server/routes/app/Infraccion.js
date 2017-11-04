var dateFormat = require('dateformat');
var streaming = require("../../js/videoStreaming");
var Helper = require("../../helpers/helper.js");
var Constants = require("../../helpers/Constants.js");
var md5 = require("md5");
var request = require('request');
var formData = require('form-data');
var fs = require('fs');
var moment = require('moment-timezone');
var request = require('request');
var formData = require('form-data');

const ElectronOnline = require('electron-online')
const connection = new ElectronOnline();
//Video 
module.exports = function(app,io,router,db,schema){
	
	let socket;	

	function actualizarInfraccion(params){

		console.log("Se va a actualizar la infracción ",params.codigo);
		db.infraccion.find({"_id":params.id})
		.then(function(docs){
			var infraccion = docs[0];
			infraccion.estado=1;
			infraccion.save(function(err,doc){
				if(err){
					socket.emit("infraccion-error",err);
				}else{
					socket.emit("infraccion-update",doc);
				}
			});
		});
	}
	function subirArchivos(params){
		
		var formData = {
			"urlVideos":params.urlVideos,
			"urlImages":params.urlImages,
			"lote":params.lote,
			"codigo":params.codigo,
			"direccion":params.direccion,
			"dispositivo":params.dispositivo,
			"estado":params.estado,
			"fecha":params.fecha,
			"lat":params.lat,
			"long":params.long,
			"lote":params.lote,
			"placa":params.placa,
			"userfile[]":[]
		};
		var files  = params.urls;
		var userfiles =[];
		
		return new Promise(function(resolve,reject){

			if(connection.status=='OFFLINE'){
				reject("No hay conexión a Internet.");
				return;
			}
			
			console.log("Se va a subir los Archivos.");

			files.forEach(function(file){
				var url = file.url;
				try{
					if(url!=undefined){
						userfiles.push(fs.createReadStream(url));
					}
				}catch(err){
					console.log("[Error al leer archivos]",url,"Error:",err);
					reject(err);
					return;					
				}
			});

			if(userfiles.length>0){
				
				formData["userfile[]"] = userfiles;
				formData["fecha"] = moment().tz(params.fecha.toString(),"America/Bogota").format('YYYY-MM-DD HH:mm:ss');
				
				request.post({
				"url":Constants.URL_SUBIR_ARCHIVOS_BACKOFFICE, 
				formData: formData},
				function(err, httpResponse, body) { 
					
					if(body!=undefined){
						var response = JSON.parse(body);
						console.log("response:: ",response.success);
						if (err) {
							console.log("[Error al enviar archivos]",err);
						   	reject("Error al enviar archivos "+err);
						   	return;
						}
						if(!response.success){
						   	reject(response.msg);
						   	return;
					    }
						
						//Actualizar Infracción.
						resolve(params);
						actualizarInfraccion(params);
					}else{
						reject(`No se pudo cargar la Infracción ${params.codigo}<br>Revise la conexión a Internet.`);
						return;
					}
				});
			}else{
				reject(`No se pudo subir la infracción: ${params.codigo}<br>Puede que los archivos no existan.`);
				return;
			}
		});
	};
	function transferFiles(params){

		return new Promise(function(resolve,reject){

			var sync = global.sync || false;
			
			console.log("Sync: ",sync);
			if(connection.status=='ONLINE'){
				if(!("length" in params)){
					subirArchivos(params)
					.then(function(doc){
						socket.emit("uploaded",`Infracción ${params.codigo} subida con éxito.`);
						resolve();
					}, function(err){
						console.log(err);
						socket.emit("infraccion-error",err);
						return;
					});
				}else{

					if(sync){
						params.forEach(function(doc,index,arr){

							var total = (arr.length - 1);
							db.infraccion.listar({"_id":doc._id},function(docs){
								
								var infraccion = docs[0];
								subirArchivos(infraccion)
								.then(function(doc){
									if(index == total){
										socket.emit("uploaded",`Se subieron (${total}) infracciones.`);
										resolve();
									}
								}, function(err){
									console.log(err)
									socket.emit("infraccion-error",err);
									return;
								});

							});
						});
					}else{
						reject("Las infracciones se cargaran en otro momento.");
					}
				}
			}else{
				reject("No se pudo subir la(s) Infraccion(es)<br>Revise su conexión a Internet.");
				return;
			}
		});
	}
	io.on("connect",function(_socket){

		socket = _socket;

		socket.on("new-infraccion",function(params){
			console.log("Nueva Infracción recibida.",params);

			transferFiles(params)
			.then(function(){
				console.log("Tranferencia exitosa.");
			},function(err){
				socket.emit("message",err);
				console.log(err);
			});
		});
		socket.on("onsync",function(sync){
			console.log("Sync: ",sync);
			global.sync = sync;
			if(sync){
				db.infraccion.find({"estado":0},function(err,docs){

					if(docs.length>0){
						transferFiles(docs)
						.then(function(){
							console.log("Tranferencia exitosa.");
						},function(err){
							console.log(err);
							socket.emit("message",err);
						});
					}else{
						socket.emit("infraccion-error","No hay archivos para subir.");
						return;
					}
				});
			}
		});
	});
	schema.virtual("urlVideos").get(function(){
		var videos = this.videos.map(function(doc){
			if(doc){
				return doc.url;
			}else{
				return;
			}
		});
		return videos.join(";");
	});
	schema.virtual("urlImages").get(function(){
		var images = this.images.map(function(doc){
			if(doc){
				return doc.url;
			}else{
				return;
			}
		});
		return images.join(";");
	});
	schema.virtual("urls").get(function(){
		return this.videos.concat(this.images);
	});
	schema.statics.listar = function(params,callback){
		var result=[];

		db.infraccion.query(params,function(err,query){
			
			var cursor = query
			.populate('creator')
			.populate('videos.video')
			.populate('images.image')
			//.select('urlVideos urlImages videos video images image')
			.cursor()
			.eachAsync(function(infraccion) {

				infraccion["urlVideos"] ="";
				infraccion["urlImages"] ="";
		        
		        infraccion.videos.forEach(function(docs,index,arr){
		        	db.video.findById(docs.video,(err,doc)=>{
		        		infraccion.videos[index]=doc;
		        	});
		        });

		        infraccion.images.forEach(function(docs,index,arr){
		        	db.image.findById(docs.image,(err,doc)=>{
		        		infraccion.images[index]=doc;
		        	});
		        });
		        result.push(infraccion);
	      	})
	    	.then(res => {
	    		callback(result);
	    	});				
		});
	}

	router.route("/infracciones")
	.get(function(req,res){
		var params = req.query || {};
		db.infraccion.listar(params,function(docs){
			res.send(JSON.stringify({data:docs,success:true}));
		});
	});

	//@infracciones/:id
	
	router.route("/infracciones")
	.post(function(req,res){
		var params = req.body;
		var lote = dateFormat(new Date(),"yyyymmdd");
		var config = global.config;

		db.infraccion.find({"lote":lote})
		.then(function(results){
			var count = (results.length + 1);
			params["codigo"] = config.camera_id+"_"+lote+"_"+count;
			params["dispositivo"] = config.camera_id;
			params["lote"] = lote;

			var arr_videos = [];
			var arr_images = [];

			//#Recorrer Videos
			db.video.find({"estado":0,"lote":lote})
			.select('url')
			.cursor()
			.eachAsync(function(video) {
				video.estado=1;
				arr_videos.push({"video":video._id});
				video.save(function(){
					// console.log("Video: ",video);
				});
			})
			.then(() => {
				console.log("Se terminaron los videos.");
				if(arr_videos.length==0){
					res.send(JSON.stringify({"success":false,"msg":"No se han grabado videos."}));
					return;
				}
				//#Recorrer Imagenes	
				db.image.find({"estado":0,"lote":lote})
				.select('url')
				.cursor()
				.eachAsync(function(image) {
					image.estado=1;
					arr_images.push({"image":image._id});
					image.save(function(){
						//console.log("Image: ",image);
					});
				})
				.then(() => {
					console.log("Se terminaron las imagenes.");
					if(arr_images.length==0){
						res.send(JSON.stringify({"success":false,"msg":"No se han capturado imagenes."}));
						return;
					}
					//#Crear la Infracción
					//console.log(params);
					db.infraccion.create(params,function(infraccion){
						
						infraccion.images = arr_images;
						infraccion.videos = arr_videos;
						infraccion.creator = global.user.id;
						infraccion.estado=0;
						//#Guardar Cambios en infraccion
						infraccion.save(function(){
							db.infraccion.listar({"_id":infraccion._id},function(docs){
								if(params.estado){
									var infraccion = docs[0];
									infraccion.estado = params.estado;
									//Emitir evento creación de la infracción
									socket.emit("infraccion",infraccion);
								}
								console.log("Se creó la infraccion.")
								res.send(JSON.stringify({"infraccion":docs[0],"success":true,"msg":"Infracción Registrada con éxito."}));
							});
						});
					});
				});
			});
		});
	});
	router.route("/infracciones/:id")
	.get(function(req,res){
		var params = req.query;
		db.infraccion.listar(params,function(docs){
			res.send(JSON.stringify({"data":docs}));
		});
	})	
	.put(function(req,res){
		var params = req.body;

		console.log("PUT::: ",params);
		db.infraccion.find({"_id":params.id})
		.then(function(docs){	
			var infraccion = docs[0];
			if(infraccion){
				
				infraccion.direccion = (params.direccion!=undefined)?params.direccion:infraccion.direccion;
				infraccion.placa = (params.placa!=undefined)?params.placa:infraccion.placa;

				infraccion.save(function(){
					db.infraccion.listar({"_id":infraccion._id},function(docs){
						//Emitir evento creación de la infracción
						socket.emit("infraccion", docs[0]);
						console.log("Se actualizó la infraccion.")
						res.send(JSON.stringify({"infraccion": docs[0],"success":true,"msg":"Infracción Actualizada con éxito."}));
					});
				});
			}else{
				res.send(JSON.stringify({"success":false,"msg":"Infracción no existe."}));
			}
		});
	});
	return router;
}