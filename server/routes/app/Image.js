var dateFormat = require('dateformat');
var streaming = require("../../js/videoStreaming");
var md5 = require("md5");
var path = require('path');
//Image  
module.exports = function(app,io,router,db,schema){
	
	var config;
	var camera;

	function init(){
		config=global.config;
		console.log(config);
		if(config!=undefined){

			camera = streaming({
				id_dispositivo:2,
				address: config.camera_ip,
				folder:path.join(global.APP_PATH,'public','images'),
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
		var lote = dateFormat(new Date(),"yyyymmdd");
		
		//Iniciar configuración camara
		init();	

		switch(action){
			case 'new':
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

							console.log(image.url_image);
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
		}	
	});
	return router;
};