const remote = require("electron").remote;
const main = remote.require('./main.js');
const path = require('path')

var Helper = remote.require("./server/helpers/helper.js");
var Constants = remote.require("./server/helpers/Constants.js");
global.APP_PATH = main.APP_PATH;
global.USER_DATA = main.USER_DATA;
global.BASE_PATH=Constants.URL_BASE;
global.IP_CAMERA ='';

function subirInfracciones(params){
	//Evento para subir nueva infracción.
	socket.emit("new-infraccion",params);
}
//Esta funcion incializa el proceso de renderización del Cliente, se utiliza en: /public/app/index.html
function __init(){

	console.log("isReady:: ",main.isReady());
	if(main.isReady()){
		main.loadConfig((err,config)=>{

			if(err){
				global.instaled = false;
				localStorage.clear();
				return;
			}
			if(!Helper.isEmpty(config)){
				global.config = config;
				global.IP_CAMERA = config.camera.camera_ip;
				global.instaled = true;
			}else{
				global.instaled = false;
				if(localStorage.user!=undefined){
					localStorage.clear();
				}
				return;
			}
			//Conectarse al Socket que controla el proceso del Cliente.
			let socket = io.connect(global.BASE_PATH,{'forceNew':true});
			//#Variable Global para uso del Lado Cliente que administra la comunicación con el Serividor Socket.
		    global.socket = socket;
			socket.on("mongo-connected",function(err){
				console.log("mongo-connected",err)
			});
			socket.on("start",function(config){
			    console.log("Socket started",config);
			    if(!("user" in config)){
			    	console.info("Sesión reiniciada.");
					localStorage.clear();
			    }
			});
			//Evento cuando se crea o actualiza una infracción.
			socket.on("infraccion",function(infraccion){
				var params = infraccion;
				// var urls = infraccion.videos.concat(infraccion.images);
				// params["urls"] = urls;
			    console.log("infracción Lista para subirse.",params);
			    //Subir la Infracción al Backoffice
			    subirInfracciones(params);
			});
			socket.on("infraccion-error",function(err){
				Msg.info(err);
			});
			socket.on("count-infraccion",function(total){
				console.log("Total infracciones: "+total);
			});

			
			socket.on("uploaded",function(msg){
				
				try{
					var component =Ext.ComponentQuery.query('infraccion')[0];
					var grid = component.down("grid");
					grid.getStore().reload();
					Msg.info(msg);
				}catch(err){
					Msg.info(msg);
				}
			});
			socket.on("infraccion-update",function(err){
				Msg.info("Infracción actualizada con éxito.");
			});
			socket.on("upload-fail",function(err){
				Msg.info(err);
			});
			
			//Sincronización automática.
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
			socket.on("message",function(msg){
				Msg.info(msg);
			});
			console.log("FalconSystem",global.instaled);
		});
	}else{
		global.ERROR={
			title:"Error",
			message:"No se pudo conectar a la base de datos<br>Asegurese de que el Servidor de Base de datos esté iniciado."
		};
	}
}
function restart(){
	main.init(function(){
		location.reload();
	});
}