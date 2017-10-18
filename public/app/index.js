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
var socket = io.connect(global.BASE_PATH,{'forceNew':true});
socket.on("start",function(config){
    console.log("Socket started");
});
