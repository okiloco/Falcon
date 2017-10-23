/**
* @Helpers: Funciones para reutilizar
*/
var pluralizeES= require('pluralize-es');
var pluralizeEN = require('pluralize');
var capitalize = require('string-capitalize');
var jsonfile = require('jsonfile')
module.exports = {
	CONFIG_DB:"./database/ManagerDB",
	APP_CONFIG:'./server/app.json',
	isEmpty:function(obj){
	  var empty=true;
	  if(obj!=undefined){
	  	for(var key in obj){
		    if(obj[key]!=undefined){ empty=false; break;}
		}
	  }
	  return empty;
	},
	pluralize:function (lang,val){
		var _val = val;
		switch(lang){
			case "es":
				_val=pluralizeES(_val);
			break;
			case "en":
				_val=pluralizeEN(_val);
			break;
		}
		return _val;
	},
	capitalize:function(str){
		return capitalize(str);
	},
	readFile:function(file){
		return new Promise(function(resolve,reject){
			var app_config = jsonfile.readFile(file,function(err,obj){
				if(err){ resolve({}); }
				resolve(obj);
			});
		});
	},
	writeFile:function(file,obj){
		return new Promise(function(resolve,reject){
			var app_config = jsonfile.writeFile(file,obj,function(err){
				if(err){ reject(err); return;}
				resolve();
			});
		});
	} 
}