Ext.define('Falcon.socket.Socket', {
	alternateClassName: 'Socket',
	init: function() {
		
		//Ext.apply(this,socket);
	},
	connect:function(){
		var socket = io.connect(BASE_PATH,{'forceNew':true});
		
		socket.on("start",function(config){

		    var camera = config.camera;
		    IP_CAMERA = camera.camera_ip;
		    
		});
	}
});