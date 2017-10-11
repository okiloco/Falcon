/*
 * This file is responsible for launching the application. Application logic should be
 * placed in the Admin.Application class.
 */
Ext.application({
    name: 'Admin',

    extend: 'Admin.Application',

    // Simply require all classes in the application. This is sufficient to ensure
    // that all Admin classes will be included in the application build. If classes
    // have specific requirements on each other, you may need to still require them
    // explicitly.
    //
    requires: [
        'Falcon.socket.Socket',
        'Admin.*'
    ],
    launch:function(){
        /*socket.on("message",function(msg){
            console.log("msg:",msg); 
        })  */
        var self =this;
        this.loadConfig(function(config){
            var instaled = config.success;
            localStorage.instaled = instaled;
        });
       /* var socket =  new Falcon.socket.Socket();
        socket.connect();  */    
    },
    loadConfig:function(callback){
        Ext.Ajax.request({
            scope: this,
            url: Constants.URL_CONFIG_APP,
            params: {
                
            },
            success: function(response) {
                var responseObject = Ext.decode(response.responseText);
                console.log(responseObject);
                if(callback!=undefined){
                    callback(responseObject);
                }       
            },
            failure: function(response) {
                Ext.Msg.show({
                    title: 'Error',
                    msg: 'Error al procesar la petición.',
                    buttons: Ext.Msg.OK,
                    icon: Ext.Msg.ERROR
                });
            }
        });
    }

});
