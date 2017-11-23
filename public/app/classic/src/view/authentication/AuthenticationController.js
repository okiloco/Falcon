Ext.define('Admin.view.authentication.AuthenticationController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.authentication',

    //TODO: implement central Facebook OATH handling here

    onFaceBookLogin : function() {
        this.redirectTo('dashboard', true);
    },

    onLoginButton: function(self) {
        var me = this;
        var form = self.up('form');
        if (form.isValid()) {
            form.submit({
                method:"GET",
                url:Constants.URL_LOGIN,
                waitMsg: 'Procesando solicitud...',
                success: function(f, action) {
                    var res = action.result;
                    localStorage.user =JSON.stringify(res.user);
                    localStorage.user_id =res.user._id;
                    localStorage.username =res.user.username;

                    socket.emit("get-infracciones");
                   
                    location.reload();
                    // me.redirectTo('ptz', true);
                },
                failure: function(f, action) {
                    Ext.Msg.show({
                        title: 'Error',
                        msg: action.result.msg,
                        buttons: Ext.Msg.OK,
                        icon: Ext.Msg.ERROR                    
                    });
                }
            });
        }
        
    },

    onLoginAsButton: function() {
        this.redirectTo('login', true);
    },

    onNewAccount:  function() {
        this.redirectTo('register', true);
    },

    onSignupClick:  function() {
        this.redirectTo('dashboard', true);
    },

    onResetClick:  function() {
        this.redirectTo(((!localStorage.user_id)?'login':'ptz'), true);
    },
    changePassword:function(self){
        var me=this,
        form=self.up('form');
        if(form.getForm().isValid()){
            form.getForm().submit({
                scope: this,
                url:Constants.PASSWORD_CHANGE,
                submitEmptyText : false,        
                success: function(f, action) {

                   if(action.result.success){
                        Ext.Msg.show({
                            title: 'Atención',
                            msg: action.result.msg,
                            buttons: Ext.Msg.OK,
                            icon: Ext.Msg.INFO,
                            fn:function(){
                                localStorage.clear();
                                location.reload();
                            }                    
                        }); 
                   }else{
                        Ext.Msg.show({
                            title: 'Error',
                            msg: action.result.msg,
                            buttons: Ext.Msg.OK,
                            icon: Ext.Msg.ERROR                    
                        }); 
                   }
                },
                failure: function(f, action) {
                    Ext.Msg.show({
                        title: 'Error',
                        msg: action.result.msg,
                        buttons: Ext.Msg.OK,
                        icon: Ext.Msg.ERROR                    
                    });
                }
            });
        }else{
            Ext.Msg.show({
                title: 'Atención',
                msg: 'Algunos datos son requeridos',
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.ERROR                    
            });
        }
    }
});