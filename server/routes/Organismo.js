var request = require('request');
var formData = require('form-data');
var Constants = require("../helpers/Constants.js");
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
	app.get("/organismos",function(req,res){

		var options = {
			"method":'GET',
			"url":Constants.URL_ORGANISMOS
		};
		request(options,function(err,response,body){
			var result = response;
			if (err) {
				// console.log("[Error en la petición]",err);
				res.send(JSON.stringify({
					"data":[],
					"success":false
				}));
			   	return;
			}
			res.send(JSON.stringify({
				"data":JSON.parse(body)
			}));
		});
	});
	app.get("/dispositivos",function(req,res){

		var params = req.query;
		var options = {
			"method":'GET',
			"url":Constants.URL_DISPOSITIVOS,
			"qs":params
		};
		request(options,function(err,response,body){
			var result = response;
			// console.log("GET BODY:::",body);
			if (err) {
				// console.log("[Error en la petición]",err);
				res.send(JSON.stringify({
					"data":[],
					"success":false
				}));
			   	return;
			}
			res.send(JSON.stringify({
				"data":JSON.parse(body)
			}));
		});
	});
}