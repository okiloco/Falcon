/**
* @author: Fabian Vargas Fontalvo
* email: f_varga@hotmail.com
*/
var events = require('events');//Events administra eventos
var session = require("express-session");
const mongoose = require("mongoose");
var md5 = require('md5');
mongoose.Promise = global.Promise;
var ObjectId = mongoose.Types.ObjectId;

var fs = require("fs");
var path = require("path");

// var Schema = mongoose.Schema;
var config = require("./config.json");
var str2json = require("../helpers/str2json");
var Helper = require("../helpers/helper");

var jsonfile = require("jsonfile");
exports.createManagerDB = function(options,callback) {
  return new ManagerDB(options,callback);
};

/*
* @ManagerDB: options
* Tiene la responsabilidad de
* Conectarse con la base de datos,
* Registra los Esquemas en la Collection schemas
* Cargar y crear instancias de Modelo con los esquemas registrados en schemas
* Administra los Eventos y funciones básicas de un Modelo.
*/
function ManagerDB(options){

	var self = this;
	this.url = './server/database/config.json';
	//"mongodb://localhost:27017/canguro-app"
	this.setConfig = function(config){
		self.active_group = config[config.active_group];
		self.models = {};
		self.schemas = {};
		self.dbname = self.active_group.dbname;

		self.host = self.active_group.host;
		self.port = self.active_group.port;

		self.linkconex = "mongodb://"+self.host+':'+self.port+'/'+self.dbname;
		self.conn = mongoose.connection;
	}
}

/**
* @Model: name,schema
* Crea una instancia de Model de mongoose
* Devuelve el Model
+ name: String Nombre del Schema
+ schema: Object instancia de mongoose.Schema
*/
function Model(name,schema){
	var model = mongoose.model(name,schema);
	
	for(var s in schema){
		// console.log(s);
	}
	model["schema"] = schema;
	model["getSchema"] =  function(){
		return schema;
	}
	return model;
}
/**
* @Schema: name,config,virtuals
* Crea una instancia de Schema de mongoose
* Devuelve el Schema
+ name: String Nombre del Schema
+ config: Object Campos del Schema
+ virtuals: function (Sin uso por ahora)
*/
function Schema(name,config,virtuals){
	
	function Password(key,options){
		mongoose.SchemaType.call(this,key,options,"Password");
	}
	Password.prototype = Object.create(mongoose.SchemaType.prototype);
	Password.prototype.cast = function(val){
		var _val = md5(val);
		return _val;
	}
	mongoose.Schema.Types.Password = Password;

	//NOTA: Importante establecer las propiedades toObject y toJSON para que funcione.
	var schema = new mongoose.Schema(config,{
	    toObject: { virtuals: true },
	    toJSON: { virtuals: true }
	});
	if(virtuals!=undefined){
		if(virtuals[name]!=undefined){
			for(var key in virtuals[name]){
				var _v = virtuals[name][key];
				if(_v!=undefined){
					/*schema.virtual(_v).get(_v["get"]);
					schema.set(_v["set"]);*/	
				}
			}
		}
	}
	return schema;
}

/*Permite emitir Eventos personalizados*/
ManagerDB.prototype = new events.EventEmitter;


/*
* @ObjectId:_id
* Util para utilizar en los documentos como primary key o
* referencia de oto modelo.
* this.ObjectId(some_id);
*/
ManagerDB.prototype.ObjectId = function(_id){
	return ObjectId(_id);
};

/**
* @parseObject: options,callback
* Convierte un objeto relación con clave valor y tipo
* para campos de esquemas.  
* Los campos estan disponibles en el objeto {this.fieds}
*/
ManagerDB.prototype.parseObject = function(obj){

	var self = this;	
	for(var s in obj){
		var field = obj[s];
		// console.log("field:: ",s,":"+obj[s]);
		if(typeof(field)=='object'){
			if(Array.isArray(field)){
				// console.log("\nisArray: ",field,typeof(field));
				field.forEach(function(item,index){
					// console.log("\tindex"+index,item);
					self.parseObject(item);
				});
			}else{
				if(field.hasOwnProperty("type")){
					if(field.type=='ObjectId'){
						field.type=mongoose.Schema.Types.ObjectId;
					}else if(field.type=='Date' && field.hasOwnProperty("default")){
						if(field.default=='now'){
							field.default = Date.now;
						}
					}
				}
				for(var k in field){
					var fieldChild = field[k];
					if(typeof(fieldChild)=='object'){
						// console.log("\tfield:: ",s);
						self.parseObject(field[s]);
					}
				}
			}

			//convert function
			if(typeof(field)=='function'){
				if(s=='convert'){
					console.log("Tiene funcion convert.");
				}
			}
		}
	}
	return obj;
}
ManagerDB.prototype.setFieldsMap = function(options,callback){
	var self = this;
	if(!self["fields"]) self["fields"]={};
	for(var s in options){
		var field = options[s];
		if(typeof(field)=='string'){
			// console.log(s+" es un string simple.");
			self["fields"][s] = {type: "String"};
		}else if(typeof(field)=='object'){

			if(Array.isArray(field)){
				// console.log(s+" es array.")
				self["fields"][s] = {type:"Array"};
				field.forEach(function(item,index){
					//var fieldChild = self.setFieldsMap(item);
					var fieldChild = item;

					for(var key in item){
						var subitem = item[key];

						if(subitem.hasOwnProperty("ref")){
							self["fields"][s]["ref"] = subitem.ref;
							// console.log("\tsubitem:",subitem)
						}
					}
					if(fieldChild.hasOwnProperty("ref")){
						self["fields"][s]["ref"] = fieldChild.ref;
						// console.log("\titem:",fieldChild)
					}
				});
			}else{
				if(field.hasOwnProperty("ref")){
					// console.log(s+" es object secundario",s)
					self["fields"][s] = {type:'Object',ref:field["ref"]};
				}else{
					self["fields"][s] = {type:(field.type!=undefined)?field.type:'Object'};
					// console.log(s+" es object principal",s)
				}
			}
		}
	}
	return field;
}
/**
* @createSchema: name,options,callback
* Crea esquemas, inicializa funciones Estaticas 
* para ser usadas en el modelo para CRUD
* Esta función define los metodos search, create y delete
* Una vez instanciado el schema se emite un evento con el nombre de éste.
* Ejemplo:
* on("NOMBRE_SCHEMA",callback);
*/
ManagerDB.prototype.createSchema = function(name, options,lang,callback){
	var self = this;
	var fields = {};
	self["fields"] = {};
	if(typeof(options)=='string'){
		options=options.replace("\n","");
		options = options.replace(/\\/g, "");
		try{
			options = JSON.parse(options);
		}catch(e){
			throw "Error al transformar JSON en: "+name+'\n'+e+'\n'+options;
		}
	}
	var raw_config = options;

	options.timestamps ={
        createdAt: 'Date',
        updatedAt: 'Date'
    };

    /*Mapping de campos del eschema*/
    var tmp_fields = this.setFieldsMap(options);
	fields = self["fields"];
	/*Objeto convertido con parametros de Schema validos para mongoose*/
	if(name!="schema"){
		options=this.parseObject(options);
	}

	console.log("......................");
	//console.log(fields);
	//return;
	
	self.emit("pre-"+name,options);
	
	var schema = this.getSchema(name) || Schema(name,options,self.virtuals);
	if(!schema) throw "No se pudo crear el Schema.";

	schema.statics.getFieldsMap = function(){
		return fields;
	};
	
	
	schema.statics.set = function(name,value){
		this[name] = value;
	}
	schema.statics.get = function(name){
		return this[name];
	}
	schema.statics.fields = function(params){
		var fields = this.getFieldsMap();
		var out_fields = (!params)?[]:{};
		
		if(params!=undefined){
			for(var key in fields){
				if(params[key]!=undefined){
					out_fields[key]=params[key];
				}
			}
		}else{
			for(var key in fields){
				out_fields.push(key);
			}
		}
		console.log(out_fields);
		return out_fields;
	}
	/**
	* @fieldsMap: params,model,callback
	* Se encarga de mapear los parametros de entrada
	* relacionandolos con los campos del esquema.
	* Devuelve el modelo con los datos pasados.
	*/
	schema.statics.fieldsMap = function(params,model,callback){
		var fields = this.getFieldsMap();
		console.log("fields::",fields);
		console.log("Params:",params);

		if(!Helper.isEmpty(fields)){
			for(var key in params){
				var field = fields[key];
				var val = params[key];
				if(field!=undefined){
					var item = {};
					if(field.type == 'Array' || field.type=='Object'){

						if(field.ref!=undefined){
							model[field.ref] = (field.type == 'Array')?[]:{};
							if(typeof(val)=='string'){
								if(field.type=='Array'){
									model[key] = [];
									item[field.ref] = ObjectId(val);
									model[key].push(item)
								}else{
									model[key]=ObjectId(val);
								}
							}else if(typeof(val)=='object'){
								model[key] = (field.type == 'Array')?[]:{};
								val.forEach(function(record,index){
									item = {};
									item[field.ref] = ObjectId(record);
									if(field.type=='Array'){
										model[key].push(item)
									}else{
										model[key]=item;
									}
								});
							}
						}
					}else if(field.type=='String'){
						model[key] = val;
					}
				}
			}
			if(callback!=undefined) callback(model);
		}else{
			throw "Debe especificar los parametros de entrada."; 
			if(callback!=undefined) callback(model);
		}
		return model;
	}
	schema.statics.create = function(params,callback){
		var model = this;
		if(!Helper.isEmpty(params)){
			if(params.id){
				this.findById(params.id,function(err,doc){
					if(!doc){ if(callback!=undefined) callback("No existe registro.",doc);};
					/*model.update(doc, { _id: params.id }, params, function(model){
						if(callback!=undefined) callback(err,doc);
					});*/
					model.fieldsMap(params,doc,function(model){
						model.save(function(err,doc){
							if(err) throw err;
							if(callback!=undefined) callback(err,doc);
						});
					});

				});
			}else{
				

				params = this.fields(params);
				model = new model(params);
				model.save(function(err,doc){
					if(err) throw err;
					if(callback!=undefined) callback(err,doc);
				});
				/*this.fieldsMap(params,model,function(model){
					model.save(function(err,doc){
						if(err) throw err;
						if(callback!=undefined) callback(err,doc);
					});
				});*/
			}
		}else{
			if(callback!=undefined) callback("No se encontraron parametros de entrada."); 
		}
	}	
	schema.statics.query = function(params,callback){
		var query = null;
		if(params.id){
			query = this.findById(params.id,function(err,doc){
				if(callback!=undefined) callback(err,query);
				return query;
			});
		}else{
			params = this.fields(params);
			query = this.find(params,function(err,docs){
				if(callback!=undefined) callback(err,query);
				return query;
			});
		}
	}
	schema.statics.search = function(params,callback){
		if(params.id){
			this.findById(params.id,function(err,doc){
				if(!doc){
					if(callback!=undefined) callback(err,doc);
				
				}
				if(callback!=undefined) callback(err,doc);
				return doc;
			});
		}else{
			params = this.fields(params);
			this.find(params,function(err,docs){
				if(callback!=undefined) callback(err,docs);
				return docs;
			});
		}
	}
	schema.statics.findOneById = function(id,callback){
		if(!id){
			if(callback!=undefined) callback();
		}else{
			this.findById(id,function(err,doc){
				if(callback!=undefined) callback(err,doc);
			});
		}
	}
	schema.statics.removeById = function(id,callback){

		if(id){
			this.findByIdAndRemove(id,function(err,doc){
				if(!doc){
					if(callback!=undefined) callback("No existe registro."); 
				}else{
					if(callback!=undefined) callback("Registro eliminado.",doc);
				}
			});
		}else{
			/*if(!Helper.isEmpty(params)){
				this.remove(params,function(err,doc){
					if(!doc){
						if(callback!=undefined) callback("No existe registro."); 
					}else{
						if(callback!=undefined) callback("Registro eliminado.",doc);
					}
				});
			}else{
			}*/
			if(callback!=undefined) callback("No se encontraron parametros de entrada."); 
		}

	}
		
	this.schemas[name] = schema;
	this.schemas[name]["name"] = name;
	
	schema["lang"] = (lang!=undefined)?lang:"es";

	self.emit(name,schema);
	

	//register Schema
	if(callback!=undefined){
		callback(false,schema)
	}
	return schema;
}

/**
* @createModel: name,schema,callback
* Crea modelos, los modelos manejan la relación con la base 
* de datos, proporcianan todos los eventos y metodos accesibles 
* en la API de mongoose.
*/
ManagerDB.prototype.createModel = function(name,schema,callback){
	var model = this.getModel(name) || new Model(name,schema);
	this.models[name] = model; 
	this.models[name]["name"] = name;

	this[name] = model;
	if(callback!=undefined){
		callback(model);
	}
	this.emit("created");
	return model;
}
/*
* @create: {name,options},callback
+ name:String Nombre del Modelo
+ options:object Parametros del Modelo
+ callback:function Funcion de Devolución
* Crea una instancia de un modelo y guarda sus valores.
* Devuelve la instancia creada del modelo.
* Útil par crear un Schema inexistente en la base de datos.
**/
ManagerDB.prototype.create = function({name,options},callback){

	var self = this;
 	var schema = this.getSchema(name);
 	var model = this.createModel(name,schema);

 	//Crear nueva instancia de modelo
 	var instance = new model(options);
 	instance.save(function(){
	 	if(callback!=undefined){
		 	callback(instance,model);
	 	}
	 	console.log("Guadado!");
 	});
	return instance;
}

ManagerDB.prototype.load =  function(callback) {
	var self = this;
	jsonfile.readFile(self.url,function(err,config){
		self.setConfig(config);
		if(typeof(callback)!=undefined) callback();
	});
}
ManagerDB.prototype.register = function(name,config,lang,callback){
	var self = this;
	//Registra esquema en la collection schema
	if(name!="schema"){
		var model = this.getModel("schema");//obtener modelo Schema
		var params ={"name":name,"config":config};

		model.findOne({"name":name},function(err,doc){

			if(!doc){
				//Crear Schema en base de datos
				self.create({
					name:"schema",
					lang:lang, 
					options:{"name":name,"config":config}
				},function(){
					//Actualizar los esquemas de la base de datos
					self.refresh(function(){

						console.log("Se registró el esquema: ",name+".")
						if(callback!=undefined){
							callback((!doc))
						}
					});
				});
				
			}else{
				//Establecer el lenguaje del Schema
				
				console.log(name,"registrado.")
				if(callback!=undefined){
					callback((!doc))
				}
			}
					
		});
	}else{
		if(callback!=undefined){
			callback(false)
		}
	}
};
/*
* @define: callback
* Crea nuevas instancias de Modelos 
* con su respectivo Schema registrado en collection Schemas
*/
ManagerDB.prototype.define =  function(callback) {

	var self = this;
	//Crear el Esquema principal de la base de datos, que contiene todos los esquemas.
	self.createSchema("schema",{name:"String",lang:{"type":"String","default":"es"}, config:"String"},"en",function(err,schema){
		//Instancia modelo Schema
		var model = self.createModel(schema.name,schema);
		if(err) throw err;
		//Cargar Schemas de la base de Datos y generar Modelos
		model.find(function(e,docs){
			if(docs.length>0)
			{
				docs.forEach(function (doc,index) {
					//Registrar los esquemas en collection Schemas
					self.register(doc.name,doc.config,doc.lang,function(){
						//Crear Esquema con la configuración registrada.
						self.createSchema(doc.name,doc.config,doc.lang,function(msg,sch){
							//Crea nueva instancia de modelo
							self.createModel(doc.name,sch,function(m){
								self.emit("define",doc.name,schema);
								if(index==docs.length - 1){
									self.emit("ready",err,schema);
									if(callback!=undefined){
										callback(err,schema);
									}
								}
							});
						});
					});
				});
			}else{
				if(callback!=undefined){
					callback(e,schema);
				}
			}
		});
	});
}
ManagerDB.prototype.refresh =  function(callback) {
	var self = this;
	//Registrar los schemas de la base de datos
	self.define(callback);
	console.log("refresh.");
}


/**
* @connect: callback
* Conecta con la base de datos MongoDB
* utilizando la propiedad linkconex de ManagerDB.
* Una vez conectado, procede a crear el esquema base
* "schema", luego crea una instancia del modelo schema.
* consulta los registros, para crear los esquemas
* y modelos de cada registro.
* La composición base de un esquema es:
+ name:String
+ config: String
* name: Representa el nombre del Schema
* config: Almacena un String en formato Json, con la
* configuración del schema.
*/
ManagerDB.prototype.connect =  function(callback) {
	var self = this;

	self.load(function(){
		mongoose.connect(self.linkconex,(err,res)=>{
			if(err){
				console.log('Error al conectarse a la base de datos.',err);
			}
			//Registrar los schemas de la base de datos
			// self.register(callback);
			if(callback!=undefined){
				callback(err,res);
			}
			return self;
		});
	});
	
	mongoose.connection.on("connected", function() {
	    console.log("Connected to " + self.linkconex);
	});

	mongoose.connection.on("error", function(error) {
	    console.log("Connection to " + self.linkconex + " failed:" + error);
	});

	mongoose.connection.on("disconnected", function() {
	    console.log("Disconnected from " + self.linkconex);
	});

	process.on("SIGINT", function() {
	    mongoose.connection.close(function() {
	        console.log("Disconnected from " + self.linkconex + " through app termination");
	        process.exit(0);
	    });
	});
}
/**
*@params: callback
* Desconecta de la base de datos
*/
ManagerDB.prototype.disconnect = function(callback) {
	mongoose.disconnect(callback);
}
/**
* @params: name
* Devuelve un Schema registrado en la colección schemas de ManagerDB.
*/ 
ManagerDB.prototype.getSchema = function(name){
	var schema = this.schemas[name];
	return schema;
}
/**
* @params: name
* Devuelve un Modelo registrado en la colección models de ManagerDB.
*/ 
ManagerDB.prototype.getModel = function(name){
	return this[name];
}