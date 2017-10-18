var dateFormat = require('dateformat');
var streaming = require("../../js/videoStreaming");
var md5 = require("md5");
//Video
module.exports = function(app,router,db,schema){
	

	var camera_config = config.camera;
	
	schema.virtual("urlVideos").get(function(){
		var videos = this.videos.map(function(doc){
			return doc.url;
		});
		return videos.join(";");
	});
	schema.virtual("urlImages").get(function(){
		var images = this.images.map(function(doc){
			return doc.url;
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
		var params = req.query;
		db.infraccion.listar(params,function(docs){
			res.send(JSON.stringify({data:docs,success:true}));
		});
	});
	router.route("/infracciones/:action")
	.post(function(req,res){
		var params = req.body;
		var lote = dateFormat(new Date(),"yyyymmdd");

		/*var videos = params.videos || [];
		var images = params.images || [];

		if(typeof(videos)=='string'){
			videos = [videos];
		}
		if(typeof(images)=='string'){
			images = [images];
		}*/
		
		db.infraccion.find({"lote":lote})
		.then(function(results){
			var count = (results.length + 1);
			params["codigo"] = camera_config.camera_id+"_"+lote+"_"+count;
			params["dispositivo"] = camera_config.camera_id;
			params["lote"] = lote;

			var videos = [];
			var images = [];
			

			db.video.find({"estado":0,"lote":lote},function(err,videos){

				if(videos.length==0){
					res.send(JSON.stringify({"success":false,"msg":"No se han grabado videos."}));
					return;
				}
			 	videos.forEach(function(video,index,array){
			 		videos.push({"video":video._id});
			 		if(index == (array.length -1 )){
			 			db.image.find({"estado":0,"lote":lote},function(err,images){

			 				if(images.length==0){
			 					res.send(JSON.stringify({"success":false,"msg":"No se han capturado imagenes."}));
			 					return;
			 				}
			 			 	images.forEach(function(image,i,arr){

			 					images.push({"image":image._id});

			 					if(i == (arr.length -1 )){
			 						db.image.update({"estado":0,"lote":lote},{"estado":1},function(){
			 							db.video.update({"estado":0,"lote":lote},{"estado":1},function(){
			 								db.infraccion.create(params,function(infraccion){
				 								infraccion.estado = 1;
				 								infraccion.images = images;
				 								infraccion.videos = videos;
						 						infraccion.save(function(){
					 								db.infraccion.listar({"_id":infraccion._id},function(docs){
			 											res.send(JSON.stringify({"infraccion":docs[0],"success":true}));
			 										});
				 								});
						 					});
			 							});
			 						});
			 					}
			 			 	});
			 			});		
			 		}
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