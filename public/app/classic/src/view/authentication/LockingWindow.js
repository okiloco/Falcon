/**
 * This class provides the modal Ext.Window support for all Authentication forms.
 * It's layout is structured to center any Authentication dialog within it's center,
 * and provides a backGround image during such operations.
 */
Ext.define('Admin.view.authentication.LockingWindow', {
    extend: 'Ext.window.Window',
    xtype: 'lockingwindow',

    requires: [
        'Admin.view.authentication.AuthenticationController',
        'Ext.layout.container.VBox'
    ],

    cls: 'auth-locked-window',
    closable: false,
    resizable: false,
    autoShow: true,
    titleAlign: 'center',
    maximized: true,
    modal: true,

    layout: {
        type: 'vbox',
        align: 'center',
        pack: 'center'
    },
    flex:1,
    initComponent: function() {
        var me = this;
        
        //console.log(me.height)
        Ext.apply(me, {
            listeners:{
                show:function(self){
                    self.setHtml('<img style="min-height:'+me.height+'px; width:100%;" src="'+Constants.URL_VIEWER+'">')
                }
            },
            html:[
            // '<div style="background-size:100% 100%; background-image: url(http://192.168.1.155/mjpg/video.mjpg) , url(http://192.168.1.155/mjpg/video.mjpg); width: 100%; height: 100px; " title="Carga primer y segundo background. Muestra primero." ></div>', 
            // '<div class="image" style="background-color:red; height:'+me.height+'px;">',
            // '<div style="background-size:100% 100%; background-image: url(http://192.168.1.155/mjpg/video.mjpg) , url(http://192.168.1.155/mjpg/video.mjpg); width: 100%; height: 100%; " title="Carga primer y segundo background. Muestra primero." ></div>',

                /*'style="background-image:url('+Constants.URL_VIEWER+'), url(./resources/images/lock-screen-background.jpg); width:100%; height:auto;"
                '<img src="'+ Constants.URL_VIEWER+'" style="width:100%; height:100%;" frameborder="0"/>',
                '<img src="./resources/images/lock-screen-background.jpg" style="width:100%; height:100%;" frameborder="0"/>',*/
            // '</div>'
            ].join("")
        });
        me.callParent(arguments);
    },
    controller: 'authentication'
});
 