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
	function countInfracciones(params){
		params = params || {};
		var lote = dateFormat(new Date(),"yyyymmdd");

		return new Promise(function(resolve,reject){
			console.log("get Infracciones",params);
			if(global.user!=undefined){

				params["creator"] = global.user.id;
				params["lote"] = lote;
				params["estado"] = 1;

				db.infraccion.listar(params)
				.then(function(docs){
					resolve(docs.length);			
				});
			}else{
				reject(0);
			}
		});
	}
	function actualizarInfraccion(params){

		console.log("Se va a actualizar la infracción ",params.codigo);
		db.infraccion.find({"_id":params.id})
		.then(function(docs){
			var infraccion = docs[0];
			infraccion.estado=1;
			infraccion.save(function(err,doc){
				try{
					if(err){
						socket.emit("infraccion-error",err);
					}else{
						socket.emit("infraccion-update",doc);
					}
				}catch(err){
					console.log("Error Socket. ",err);
				}
			});
		});
	}

	async function getFiles(files){
		var userfiles = [];

		return new Promise(function(resolve,reject){

			//files.forEach(function(file,index,arr){
			for(let file of files){
				var total = (arr.length -1);
				var url = ("image" in file)?file.image.url:file.url;
				console.log("\turl:",url);
				if(url==undefined){
					reject("Url indefinida.");
					return;
				}else{
					console.log(file);
				}
				try{
					const contents = fs.readFile(url);
					userfiles.push(contents);
					console.log(userfiles.length);
					if(index == total){
						console.log("Ultimo cargado!")
						resolve(userfiles);
					}
				}catch(err){
					reject(err);
					return;					
				}
			}
			//});
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
		if(params==undefined){
			reject("No se pasaron parametros.");
			return;
		}
		var files  = params.urls;
		var userfiles = [];
		
		return new Promise(function(resolve,reject){

			if(connection.status=='OFFLINE'){
				reject("No hay conexión a Internet.");
				return;
			}
			console.log("Se va a subir los Archivos.",params);
			files.forEach(function(file,index,arr){
				var url = ("image" in file)?file.image.url:file.url;
				var total = (arr.length-1)
				try{
					var readStream = fs.createReadStream(url);
					let size = fs.lstatSync(url).size;
					let bytes = 0;
					userfiles.push(readStream);
					console.log(index,total);
					readStream.on('data', (chunk) => {
					    console.log(bytes += chunk.length, size);
					    if(bytes==size){
					    	console.log("Read end ",url);
					    }
				    });
				}catch(err){
					console.log("Error en la url",file)
					return;
				}
			});

			formData["userfile[]"] = userfiles;
			formData["fecha"] = moment().tz(params.fecha.toString(),"America/Bogota").format('YYYY-MM-DD HH:mm:ss');
			request.post({
			"url":Constants.URL_SUBIR_ARCHIVOS_BACKOFFICE, 
			formData: formData},
			function(err, httpResponse, body) { 
				
				console.log("BODY:: ",body)
				if(body!=undefined && body!=null){
					try{
						var response = JSON.parse(body);
						//console.log("response:: ",response.success);
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
						actualizarInfraccion(params);
						resolve(response);
					}catch(err){
						reject(err);
						return;
					}
				}else{
					reject(`No se pudo cargar la Infracción ${params.codigo}<br>Revise la conexión a Internet.`);
					return;
				}
			});
			/*getFiles(files)
			.then(function(userfiles){
				if(userfiles.length>0){
					

					formData["userfile[]"] = userfiles;
					formData["fecha"] = moment().tz(params.fecha.toString(),"America/Bogota").format('YYYY-MM-DD HH:mm:ss');
					
					request.post({
					"url":Constants.URL_SUBIR_ARCHIVOS_BACKOFFICE, 
					formData: formData},
					function(err, httpResponse, body) { 
						
						if(body!=undefined && body!=null){
							var response = JSON.parse(body);
							//console.log("response:: ",response.success);
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
			},function(err){
				reject("Error al adjuntar archivos "+err);
			});	*/		
		});
	};

	function transferAllFiles(infracciones){
		var total = infracciones.length,
		infraccion = {};

		return new Promise(function(resolve,reject){
			if(total>0){
				db.infraccion.listar({"estado":0},function(infracciones){
					total=infracciones.length;

					if(total>0){
						infraccion = infracciones[0];
						console.log("Transfer Infraccion: ",infraccion.codigo);
						db.infraccion.listar({"_id":infraccion._id},function(docs){
							var infraccion = docs[0];
							
							if(docs.length>0){
								transferFiles(infraccion)
								.then(function(){
									transferAllFiles(infracciones)
									.then(function(){
										//reject();
									});
								},function(){
									//reject();
								});
							}else{
								console.log("Infracciones finalizadas.");
								resolve("Infracciones finalizadas.");
							}
						});
					}else{
						reject();
					}
				});
			}else{
				reject();
			}
		});
	}
	function transferFiles(params){

		return new Promise(function(resolve,reject){

			var sync = global.sync || false;
			
			console.log("Sync: ",sync);
			if(connection.status=='ONLINE'){
				if(!("length" in params)){
					subirArchivos(params)
					.then(function(doc){
						try{
							socket.emit("uploaded",`Infracción ${params.codigo} subida con éxito.`);
						}catch(err){
							console.log("ERROR Socket emit: uploaded: ",err);
						}
						resolve();
					}, function(err){
						console.log(err);
						socket.emit("infraccion-error",err);
						return;
					});
				}else{

					if(sync){
						//params.forEach(function(doc,index,arr){

							var total = (params.length - 1);
							db.infraccion.listar({"estado":0},function(docs){
								
								if(docs.length>0){
									//var infraccion = docs[0];
									transferAllFiles(docs);
								}else{
									console.log("No hay infracciones para subir.");
									reject("No hay infracciones para subir.");
									return;
								}
								/*transferFiles(infraccion)
								.then(function(){
									console.log()
								});*/
								// socket.emit("infraccion",infraccion);
								/*subirArchivos(infraccion)
								.then(function(doc){
									if(index == total){
										socket.emit("uploaded",`Se subieron (${total}) infracciones.`);
										resolve();
									}
								}, function(err){
									console.log(err)
									socket.emit("infraccion-error",err);
									return;
								});*/

							//});
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
				countInfracciones()
				.then(function(total){
					socket.emit("count-infraccion",total);
				});
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
							countInfracciones()
							.then(function(total){
								socket.emit("count-infraccion",total);
							});
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
		socket.on("get-infracciones",function(params){
			console.log("get-infracciones:")
			countInfracciones(params)
			.then(function(total){
				socket.emit("count-infraccion",total);
			});
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
				return ("image" in doc)?doc.image.url:doc.url;
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

		return new Promise(function(resolve,reject){
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
		    		if(callback!=undefined){
		    			callback(result);
		    		}
	    			resolve(result);
		    	});				
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

	router.route("/evidencias/:_id")
	.get(function(req,res){
		db.infraccion.listar({"_id":req.params._id},function(docs){
			var infraccion = docs[0];
			res.send(JSON.stringify({data:infraccion.urls,success:true}));
		});
	});

	//@infracciones/:id
	
	router.route("/infracciones/count")
	.get(function(req,res){

		countInfracciones(req.query)
		.then(function(total){
			res.send(JSON.stringify({"total":total,"success":true}));
		});
	});

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
			db.video.find({"estado":0})
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
				db.image.find({"estado":0})
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
						console.log("Se actualizó la infraccion.")
						res.send(JSON.stringify({"infraccion": docs[0],"success":true,"msg":"Infracción Actualizada con éxito."}));
						if(!(("placa" in params) || ("direccion" in params))){
							socket.emit("infraccion", docs[0]);
							return;
						}
					});
				});
			}else{
				res.send(JSON.stringify({"success":false,"msg":"Infracción no existe."}));
			}
		});
	});
	return router;
}