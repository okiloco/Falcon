/**
 * @class Admin.view.authentication.WizardFormController
 */
Ext.define('Admin.view.wizard.WizardFormController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.wizardform_c',


    init: function(view) {
        var tb = this.lookupReference('navigation-toolbar'),
            buttons = tb.items.items,
            ui = view.colorScheme;

        //Apply styling buttons
        if (ui) {
            buttons[1].setUI(ui);
            buttons[2].setUI(ui);
        }
    },

    onNextClick: function(button) {
        //This is where you can handle any logic prior to moving to the next card
        var panel = button.up('panel');
        panel.getViewModel().set('atBeginning', false);
        
        try{
            this.navigate(button, panel, 'next');
        }catch(err){
            console.log(err.message)
        }
    },

    onPreviousClick: function(button) {
        var panel = button.up('panel');

        panel.getViewModel().set('atEnd', false);
        
        this.navigate(button, panel, 'prev');
    },   
    onFinishClick: function() {
        this.redirectTo('login', true);
    },

    navigate: function(button, panel, direction) {
        var layout = panel.getLayout(),
            progress = this.lookupReference('progress'),
            model = panel.getViewModel(),
            progressItems = progress.items.items,
            item, i, activeItem, activeIndex;

        layout[direction]();

        activeItem = layout.getActiveItem();
        activeIndex = panel.items.indexOf(activeItem);

        if(button.id=='finishButton'){
            var panel = button.up("wizard-panel"),
            params={},
            valid=true;
            Ext.Array.each(panel.query('field'),function(item,index){
                params[item.name]=item.getValue();
                if(!item.isValid()){
                    valid=false;
                }
            });

            if(valid){
              //
            }else{
                Ext.Msg.show({
                    title: 'Atención',
                    msg: 'Algunos campos son requeridos.',
                    buttons: Ext.Msg.OK,
                    icon: Ext.Msg.WARNING                    
                });
            }
        }
        for (i = 0; i < progressItems.length; i++) {
            item = progressItems[i];

            if (activeIndex === item.step) {
                item.setPressed(true);
            }
            else {
                item.setPressed(false);
            }
        }
        return;


        for (i = 0; i < progressItems.length; i++) {
            item = progressItems[i];

            if (activeIndex === item.step) {
                item.setPressed(true);
            }
            else {
                item.setPressed(false);
            }
            
            var finishButton = Ext.getCmp('finishButton');
            var volButton = Ext.getCmp('vol_btn');
            var sigButton = Ext.getCmp('sig_btn');
            var organismo = Ext.getCmp('organismo').getValue();
            var camera_id = Ext.getCmp('camera_id').getValue();
            var camera_ip = Ext.getCmp('camera_ip').getValue();
            var camera_user = Ext.getCmp('camera_user').getValue();
            var camera_password = Ext.getCmp('camera_password').getValue();
            var username = Ext.getCmp('username').getValue();
            var email = Ext.getCmp('email').getValue();
            var password = Ext.getCmp('password').getValue();
            var re_password = Ext.getCmp('re_password').getValue();
            var movil_plate = Ext.getCmp('movil_plate').getValue();
            var movil_name = Ext.getCmp('movil_name').getValue();
            var test = new Array(finishButton,volButton,sigButton,organismo,camera_id,camera_ip,camera_user,camera_password,username,email,password,re_password,movil_plate,movil_name);
            
            function checkArray(array_fields){
               for(var i=0;i<array_fields.length;i++){
                   if(array_fields[i] === "" || array_fields[i] ===null){   
                     Ext.Msg.show({
                            title : 'Info',
                            msg : 'Error al procesar la petición, Por lo menos alguno de campos esta vacio. </br>Verifique los campos e intentelo nuevamente.',
                            width : 500,
                            closable : false,
                            buttons : Ext.Msg.OK,
                            buttonText : 
                            {
                                ok : 'Regresar'
                            },
                            multiline : false,
                            fn : function(buttonValue, inputText, showConfig){
                                volButton.fireEvent('click', volButton);
                                volButton.fireEvent('click', volButton);
                                volButton.fireEvent('click', volButton);
                            },
                            icon : Ext.Msg.QUESTION
                    });
                  }
               }
            }

            if (Ext.isIE8) {
                item.btnIconEl.syncRepaint();
            }
        }

        activeItem.focus();
        // beginning disables previous
        if (activeIndex === 0) {
            model.set('atBeginning', true);

        }

        if (activeIndex === 3) {
            if (password!=re_password) {
                Ext.Msg.show({
                    title : 'Info',
                    msg : 'Las contraseñas no coinciden, Por favor verifique.',
                    width : 300,
                    closable : false,
                    buttons : Ext.Msg.OK,
                    buttonText : 
                    {
                        ok : 'Regresar'
                    },
                    multiline : false,
                    fn : function(buttonValue, inputText, showConfig){
                        volButton.fireEvent('click', volButton);
                    },
                    icon : Ext.Msg.QUESTION
            });
                        
            }
        }
        // wizard is 4 steps. Disable next at end.
        if (activeIndex === 4) {
            checkArray(test);
            model.set('atEnd', true);
            volButton.hide();
            sigButton.hide();
                Ext.Ajax.request({
                    scope: this,
                    url: Constants.URL_WIZARD,
                    params: {
                        organismo:organismo,
                        camera_id:camera_id,
                        camera_ip:camera_ip,
                        camera_user:camera_user,
                        camera_password:camera_password,
                        username:username,
                        email:email,
                        password:password,
                        re_password:re_password,
                        movil_plate:movil_plate,
                        movil_name:movil_name
                    },
                    success: function(response) {
                        finishButton.show();
                        var responseObject = Ext.decode(response.responseText);
                        Ext.Msg.show({
                            title: 'Aviso',
                            msg: responseObject.msg,
                            buttons: Ext.Msg.OK,
                            icon: Ext.Msg.INFO                    
                        });     
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
    }
});
