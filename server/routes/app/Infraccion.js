var dateFormat = require('dateformat');
var streaming = require("../../js/videoStreaming");
var md5 = require("md5");
var request = require('request');
var formData = require('form-data');
var fs = require('fs');

//Video 
module.exports = function(app,io,router,db,schema){
	

	
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

	schema.statics.listar = function(params,callback){
		var result=[];
		db.infraccion.query(params,function(err,query){
			
			var cursor = query
			.populate('videos.video')
			.populate('images.image')
			//.select('urlVideos urlImages videos video images image')
			.cursor()
			.eachAsync(function(infraccion) {

				infraccion["urlVideos"] ="";
				infraccion["urlImages"] ="";
		        
		        infraccion.videos.forEach(function(docs,index,arr){
		        	console.log("Video:",docs.video)
		        	db.video.findById(docs.video,(err,doc)=>{
		        		// console.log("Video:",doc);
		        		infraccion.videos[index]=doc;
		        	});
		        });

		        infraccion.images.forEach(function(docs,index,arr){
		        	console.log("Imagen:",docs.image)
		        	db.image.findById(docs.image,(err,doc)=>{
		        		// console.log("Imagen:",doc);
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

	//@infracciones/:action
	router.route("/infracciones/:action")
	.post(function(req,res){
		var params = req.body;
		var lote = dateFormat(new Date(),"yyyymmdd");
		var socket = global.socket;
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
					console.log("Video: ",video);
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
						console.log("Image: ",image);
					});
				})
				.then(() => {
					console.log("Se terminaron las imagenes.");
					if(arr_images.length==0){
						res.send(JSON.stringify({"success":false,"msg":"No se han capturado imagenes."}));
						return;
					}
					//#Crear la Infracción
					db.infraccion.create(params,function(infraccion){
						
						infraccion.images = arr_images;
						infraccion.videos = arr_videos;
						infraccion.creator = global.user.id;
						//#Guardar Cambios en infraccion
						infraccion.save(function(){
							db.infraccion.listar({"_id":infraccion._id},function(docs){
								if(params.estado){
									console.log("Estado: ",params.estado);
									//#emit:[infraccion]
									socket.emit("infraccion",docs[0]);
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
	});
	return router;
}