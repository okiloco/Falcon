var dateFormat = require('dateformat');
var streaming = require("../../js/videoStreaming");
var md5 = require("md5");
var ffmpeg = require('fluent-ffmpeg');
var fs = require('fs'),
    http = require('http'),
    url = require('url'),
    path = require('path');

//Video 
module.exports = function(app,io,router,db,schema){
	//Ejemplo de Virtual
	var config = global.config;
	var camera_config = config.camera;

	/*schema.virtual("alias").get(function(){
		return this.username+"-lord";
	});*/
	var camera = streaming({
		id_dispositivo:2,
		address: camera_config.camera_ip,
		folder:'./public/images/',
		prefix:camera_config.camera_id,
		port: '80',
		username: camera_config.camera_user,
		password: camera_config.camera_password,
		db:db
	}); 

	var video = camera.createRecord({
		resolution: '800x450',
		videocodec:'h264',
		folder:'./public/videos/',
		prefix:camera_config.camera_id,
		audio:0,
		fps:25
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
		var action = req.query.action;
		var params = req.query;
		var lote = dateFormat(new Date(),"yyyymmdd");
		
		db.video.find({"lote":lote})
		.then(function(results){
			params["count"] = (results.length + 1);
			console.log("Consecutivo ",params["count"]);
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
							"filename":video.filename,
							"lote":video.lote,
							"url":video.url_video,
							"creator":global.user.id
						},function(doc,err){
							
							var url_video_tmp =video.url_video_tmp; 
							var url_video =video.url_video; 
							video.on("video-convert",function(){
								global.socket.emit("video-convert");
							});

                            res.send(JSON.stringify({
   								success:true,
   								msg:'Video creado con éxito',
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
		var range = req.headers.range;


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
				// 
				var filename = doc.url;
				// var filename = "public/videos/20171017/movie.mp4";
				// var readStream = fs.createReadStream(filename);
				var total;

				console.log("video:",filename)
				if (!fs.existsSync(filename)) {
					console.log("El archivo no existe.");
					global.socket.emit("video-not-found",req.query.id);
				}else{
					res.writeHead(200,{'Content-Type':'video/mp4'	
					});
					fs.createReadStream(filename).pipe(res);
				}

			});
		break;	
		}
	});

	
	const HTML_PATH = 'public/index.html';
	const SIZE_INDEX = fs.statSync(HTML_PATH).size;

	http.createServer((req,res)=>{
		res.writeHead(200,{'Content-Length':SIZE_INDEX,
						   'Content-Type':'text/html'	
		});
		fs.createReadStream(HTML_PATH).pipe(res);
	}).listen(8080);
	return router;
}