module.exports = function(app,io,db,schema){

	db.on("organismo",function(schema){
		app.get("/organismos",function(req,res){
			db.organismo.search(req.query,function(err,docs){
				res.send(JSON.stringify(docs));
			});
		});
	});
	app.post("/organismos",function(req,res){
		var params = req.body;
		db.organismo.create(params,function(doc,model){
			res.send(JSON.stringify(doc));
		});					
	});
	
}