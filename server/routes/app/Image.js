var dateFormat = require('dateformat');
var streaming = require("../../js/videoStreaming");
var md5 = require("md5");
//Image
module.exports = function(app,router,db,schema){
	
	var config = global.config;
	var camera_config = config.camera;

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
	router.get("/image/:action",(req,res)=>{
		var params = req.params,
		action = params.action;
		var lote = dateFormat(new Date(),"yyyymmdd");
		
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