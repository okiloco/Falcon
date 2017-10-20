const remote = require("electron").remote;
const main = remote.require('./main.js');
var Helper = remote.require("./server/helpers/helper.js");
var app_config = './server/app.json';

global.BASE_PATH='http://localhost:3000/';

Helper.readFile(app_config)
.then(function(config){

	global.config = config;
	global.IP_CAMERA = config.camera.camera_ip;
	global.instaled = true;

},function(err){
	global.instaled = false;
});


let socket = io.connect(global.BASE_PATH,{'forceNew':true});

socket.on("start",function(config){
    console.log("Socket started",config);
    global.socket = socket;
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

socket.on("message",function(msg){
	Msg.info(msg);
});
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
