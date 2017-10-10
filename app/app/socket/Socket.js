Ext.define('Falcon.socket.Socket', {
	alternateClassName: 'Socket',
	constructor: function() {
		var socket = io.connect(BASE_PATH,{'forceNew':true});
		socket.emit('connect',function(data){
			console.log("message from socket. ",data);
		});
		socket.on("start",function(params){
		    global.config = params;
		    var camera = config.camera;
		    IP_CAMERA = camera.camera_ip;
		    Constants.URL_VIEWER=IP_CAMERA+'mjpg/video.mjpg';
		    
			console.log(config);
		});
		Ext.apply(this,socket);
	},
	connect:function(){
		console.log(this);
		
	}
});