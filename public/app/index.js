const remote = require("electron").remote;
const main = remote.require('./main.js');


var Helper = remote.require("./server/helpers/helper.js");
var Constants = remote.require("./server/helpers/Constants.js");
var app_config = './server/app.json';

global.BASE_PATH=Constants.URL_BASE;
global.IP_CAMERA ='';
function subirInfracciones(params){
	socket.emit("new-infraccion",params);
	socket.on("uploaded",function(err,doc){
		if(err){
			console.log("Error: ",err);
			Ext.Msg.show({
			    title: 'Error',
			    msg: err,
			    buttons: Ext.Msg.OK,
			    icon: Ext.Msg.ERROR                    
			});
		}else{
			Msg.info("Archivos subidos con éxito.");
		}
	});
	socket.on("infraccion-update",function(err){
		Msg.info("Infracción actualizada con éxito.");
	});
	socket.on("upload-fail",function(err){
		if(err){
			console.log("Error: ",err);
			Ext.Msg.show({
			    title: 'Error',
			    msg: err,
			    buttons: Ext.Msg.OK,
			    icon: Ext.Msg.ERROR                    
			});
		}
	});
}
//Esta funcion incializa el proceso de renderización del Cliente, se utiliza en: /public/app/index.html
function __init(){

	Helper.readFile(app_config)
	.then(function(config){

		if(!Helper.isEmpty(config)){
			global.config = config;
			global.IP_CAMERA = config.camera.camera_ip;
			global.instaled = true;
		}else{
			global.instaled = false;
		}

		//Conectarse al Socket que controla el proceso del Cliente.
		let socket = io.connect(global.BASE_PATH,{'forceNew':true});
		//#Variable Global para uso del Lado Cliente que administra la comunicación con el Serividor Socket.
	    global.socket = socket;
		socket.on("start",function(config){
		    console.log("Socket started",config);
		    if(!("user" in config)){
		    	console.info("Sesión reiniciada.");
				localStorage.clear();
		    }
		});
		socket.on("infraccion",function(infraccion){
			var params = infraccion;
			var urls = infraccion.videos.concat(infraccion.images);
			params["urls"] = urls;

		    console.log("infracción Lista para subirse.",params);
		    subirInfracciones(params);
			Msg.info("Infracción Lista para subirse.");
		});

		socket.on("infraccion-error",function(infraccion){
			Ext.Msg.show({
			    title: 'Atención',
			    msg: 'No se pudo actualizar la Infracción, verifique su conexión a Internet.',
			    buttons: Ext.Msg.OK,
			    icon: Ext.Msg.WARNING                    
			});
		});
		socket.on("message",function(msg){
			Msg.info(msg);
		});
		
		var sync;
		socket.on('online', (msg,status) => {
			sync = global.sync || false;
			if(Msg!=undefined){
				Msg.info(msg);
				console.log("sync: ",sync);
				socket.emit("onsync",sync);
			}
		  	console.log('App is online!')
		});
		socket.on('offline', (msg,status) => {
			sync = global.sync || false;
			if(Msg!=undefined){
				Msg.info(msg);
				console.log("sync: ",sync);
				socket.emit("onsync",sync);
			}
		  	console.log('App is offline!')
		});
		console.log("FalconSystem",global.instaled);

	},function(err){
		global.instaled = false;
	});
}