Ext.define('Falcon.socket.Socket', {
	alternateClassName: 'Socket',
	init: function() {
		console.log(BASE_PATH);
	},
	connect:function(){
		var socket = io.connect(BASE_PATH,{'forceNew':true});
		socket.on('messages',function(data){
			console.log("message from socket. ",data);
		});
	}
});