var md5 = require("md5");

module.exports.controller = function(name,app,db){
	
	app.get("/schemas",function(req,res){
		console.log(db.schema.getFields());
		db.schema.search(req.query,function(err,docs){
			res.send(JSON.stringify(docs));
		});
	});
	app.post("/schema", function(req,res){
		var params = req.body;
		
		if(params.id){
			db.schema.findById(params.id,function(err,schema){
				
				if(!schema){
					res.send(JSON.stringify({
						success:false,
						msg:'Esquema no existe.',
					}));
					return;
				}

				schema.name = params.name;
				schema.config = params.config;
				schema.lang = params.lang;

				schema.save(function(err,doc){
					res.send(JSON.stringify({
						success:true,
						msg:'Esquema actualizado con éxito. ',
						url:doc.url
					}));
				});
			});
		}else{
			db.register(params.name,params.config,function(err,doc){
				res.send(JSON.stringify({
					success:err,
					msg:(err)?doc:'el esquema ya existe.'
				}));
			});	
		}	
	});
}