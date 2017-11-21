var dateFormat = require('dateformat');
var streaming = require("../../js/videoStreaming");
var Constants = require("../../helpers/Constants.js");
var md5 = require("md5");
var fs = require('fs'),
    http = require('http'),
    url = require('url'),
    path = require('path');
//Image  
module.exports = function(app,io,router,db,schema){
	
	var config;
	var camera;
	schema.statics.listar = function(params,callback){
		params["creator"] = global.user._id;
		db.image.search(params,function(err,docs){
			if(callback!=undefined){
				callback(docs);		
			} 
		});
	}

	function init(){
		config=global.config;
		if(config!=undefined){

			camera = streaming({
				id_dispositivo:2,
				address: config.camera_ip,
				folder:path.join(Constants.URL_APP_RESOURCES,'images'),
				prefix:config.camera_id,
				port: '80',
				username: config.camera_user,
				password: config.camera_password,
				db:db
			});
		}else{
			throw "No se econtró configuración de la camara.";
		}
	}
	router.get("/image/:action",(req,res)=>{
		var params = req.params,
		action = params.action;
		

		switch(action){
			case 'new':
				//Iniciar configuración camara
				init();
				var lote = dateFormat(new Date(),"yyyymmdd");	
				db.image.find({"lote":lote})
				.then(function(results){
					var count = (results.length + 1);
					camera.requestImage({
						resolution: '1920x1080',
						compression: 30,
						rotation: 0,
						count:count
					}, function(err, image) {
						if (!err){

							db.image.create({
								"filename":image.filename,
								"lote":image.lote,
								"url":image.url_image,
								"creator":global.user.id
							},function(doc,err){
								res.send(JSON.stringify({
									success:true,
									msg:'Imagen capturada con éxito',
									image:doc
								}));
							});		
						}else{
							res.send(JSON.stringify({
								success:false,
								msg:err
							}));
						}
					});
				});
			break;
			case 'preview':

				if(!req.query.id){
					res.writeHead(200,{'Content-Type':'image/jpg'	
					});
					fs.createReadStream(filename).pipe(res);
					return;
				}
				db.image.findById(req.query.id,function(err,doc){
					var filename = path.join(Constants.URL_APP_RESOURCES,doc.url);
					if (!fs.existsSync(filename)) {
						console.log("El archivo no existe.");
						global.socket.emit("image-not-found",req.query.id);
						return;
					}else{
						res.writeHead(200,{'Content-Type':'image/jpg'	
						});
						fs.createReadStream(filename).pipe(res);
					}

				});
			break;
		}	
	});

	router.get("/stream",(req,res)=>{

		var params = req.query,
		action = params.action;

		config=global.config;
		camera = streaming({
			id_dispositivo:2,
			address: config.camera_ip,
			folder:path.join(global.APP_PATH,'public','images'),
			prefix:config.camera_id,
			port: '3128',
			username: config.camera_user,
			password: config.camera_password,
			db:db
		});

		camera.move(params,action, function(err, image) {
			res.send(JSON.stringify({
				success:true,
				msg:err
			}));
		});
	});

	router.route("/images").get(function(req,res){
		db.image.listar(req.query,function(docs){
			res.send(JSON.stringify({data:docs,success:true}));
		});
	});
	

	return router;
};