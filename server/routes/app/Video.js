var dateFormat = require('dateformat');
var streaming = require("../../js/videoStreaming");
var Constants = require("../../helpers/Constants.js");
var md5 = require("md5");
var ffmpeg = require('fluent-ffmpeg');
var ffmpeg = require('fluent-ffmpeg');
var fs = require('fs'),
    http = require('http'),
    url = require('url'),
    path = require('path');

//Video 
module.exports = function(app,io,router,db,schema){
	//Ejemplo de Virtual
	var config;
	var video;
	var socket;
	/*schema.virtual("alias").get(function(){
		return this.username+"-lord";
	});*/
	io.on("connect",function(_socket){
		if(socket==undefined){
			socket = _socket;
			console.log("Video listener Socket!");
		}
	});
	function convertVideo(urlVideo,urlVideoDestino){
		
		return new Promise(function(resolve,reject){
			  var proc = new ffmpeg({ source: urlVideo })
			  .withSize('800x450')
			  .withVideoBitrate(800)
			  .withVideoCodec('libx264')
			  .withFps(30)
			  .saveToFile(urlVideoDestino, function(stdout, stderr) {
			  });

			  proc.on("end",function(){
			  	resolve();
			  	console.log("El archivo se ha convertido con éxito.");
			  	// global.socket("message","El archivo se ha convertido con éxito.");
			  });
		});
	}
	router.get("/video",(req,res)=>{

		config = global.config;
		var action = req.query.action;
		var params = req.query;
		var lote = dateFormat(new Date(),"yyyymmdd");
		var camera = streaming({
			id_dispositivo:2,
			address: config.camera_ip,
			folder:path.join(Constants.URL_APP_RESOURCES,'images'),
			prefix:config.camera_id,
			port: '80',
			username: config.camera_user,
			password: config.camera_password,
			db:db
		}); 

		video = camera.createRecord({
			resolution: '800x450',
			videocodec:'h264',
			folder:path.join(Constants.URL_APP_RESOURCES,'videos'),
			prefix:config.camera_id,
			audio:0,
			fps:25
		});

		db.video.find({"lote":lote})
		.then(function(results){
			params["count"] = (results.length + 1);
			console.log("Consecutivo ",params["count"]);

           	video.on("playing",function(playing,seg){
				console.log("on video-playing.",playing,seg);
				io.sockets.emit("video-playing",playing,seg);
			});	
			video.on("start-record",function(){
				console.log("on start record.");
				io.sockets.emit("start-record");
			});

			video.on("video-start-convert",function(){
				console.log("on video-start-convert.");
				io.sockets.emit("video-start-convert");
			});	

		 	video.record(params,function(rec){
				console.log("end.");
				video.stop(function(){
					if(!rec){
						res.send(JSON.stringify({
							success:false,
							msg:"No se pudo grabar el video.<br>Revise la conexión con la camara.<br>Puede que el video no pueda rescribirse."
						}));
					}else{
						db.video.create({
							"estado":-1,
							"filename":video.filename,
							"lote":video.lote,
							"url":video.url_video,
							"creator":global.user.id
						},function(doc,err){
							

							io.sockets.emit("video-preview",doc._id,fs.existsSync(path.join(Constants.URL_APP_RESOURCES,video.url_video)));

							video.on("video-convert",function(){
								console.log("on video-convert.",doc._id);
								doc.estado = 0;
								doc.save(function(err,doc){
									io.sockets.emit("video-convert",doc._id);
								});
							});

                            res.send(JSON.stringify({
   								success:true,
   								msg:'Video creado con éxito.<br>Por favor, espere mientras el video se codifica.',
   								video:doc
   							}));
						});
					}
				});
		 	});
		},function(){
			console.log("Error al listar Videos DB.");
		});
	});
	router.route("/video/:action")
	.get(function(req,res,content){
		var params = req.params,
		action = params.action;

		switch(action){
			case 'stop':
				var rec = video.stop(function(record){
					res.send(JSON.stringify({
						success:true,
						msg:'Video detenido.'
					}));
				});
			break;
			case 'preview':
				db.video.findById(req.query.id,function(err,doc){
					console.log("preview video: ",err,doc);
					var filename = path.join(Constants.URL_APP_RESOURCES,doc.url);
					//console.log("preview video:",filename);
					
					if (!fs.existsSync(filename)) {
						console.log("El archivo no existe.");
						io.sockets.emit("video-not-found",req.query.id);
						return;
					}else{
						res.writeHead(200,{'Content-Type':'video/mp4'	
						});
						fs.createReadStream(filename).pipe(res);
					}

				});
			break;	
		}
	});

	schema.statics.listar = function(params,callback){
		params["creator"] = global.user._id;
		db.video.find({
			$or:[{"estado":params.estado},{"estado":-1}],
			$and:[{"creator":global.user._id}]
		},function(err,docs){
			if(callback!=undefined){
				callback(docs);		
			} 
		});
	}
	router.route("/videos").get(function(req,res){
		db.video.listar(req.query,function(docs){
			res.send(JSON.stringify({data:docs,success:true}));
		});
	});
	/*	
	const HTML_PATH = 'public/index.html';
	const SIZE_INDEX = fs.statSync(HTML_PATH).size;

	http.createServer((req,res)=>{
		res.writeHead(200,{'Content-Length':SIZE_INDEX,
						   'Content-Type':'text/html'	
		});
		fs.createReadStream(HTML_PATH).pipe(res);
	}).listen(8080);*/
	return router;
}