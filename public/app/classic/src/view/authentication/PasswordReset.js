Ext.define('Admin.view.authentication.PasswordReset', {
    extend: 'Admin.view.authentication.LockingWindow',
    xtype: 'passwordreset',

    requires: [
        'Admin.view.authentication.Dialog',
        'Ext.form.Label',
        'Ext.form.field.Text',
        'Ext.button.Button'
    ],

    title: 'Solicitar Cambio de Contraseña',

    defaultFocus : 'authdialog',  // Focus the Auth Form to force field focus as well
    initComponent: function() {
        var me = this;
        Ext.apply(me, {
           items: [
               {
                   xtype: 'authdialog',
                   width: 455,
                   defaultButton: 'resetPassword',
                   autoComplete: true,
                   bodyPadding: '20 20',
                   layout: {
                       type: 'vbox',
                       align: 'stretch'
                   },
                   
                   defaults : {
                       margin: '10 0',
                       height: 55
                   },
                   cls: 'auth-dialog-login',
                   items: [
                       {
                           xtype: 'label',
                           cls: 'lock-screen-top-label',
                           text: 'Ingrese su contraseña actual, luego digite su nueva contraseña.'
                       },
                       {
                           xtype: 'textfield',
                           emptyText: 'Contraseña Actual',
                           cls: 'auth-textbox',
                           inputType: 'password',
                           triggers: {
                               glyphed: {
                                   cls: 'trigger-glyph-noop auth-email-trigger'
                               }
                           },
                           name: 'current_password',
                           allowBlank : false
                       },
                       {
                           xtype: 'textfield',
                           itemId: 'pass',
                           emptyText: 'Nueva Contraseña',
                           cls: 'auth-textbox',
                           inputType: 'password',
                           name: 'password',
                           listeners: {
                               validitychange: function(field){
                                   field.next().validate();
                               },
                               blur: function(field){
                                   field.next().validate();
                               }
                           },
                           triggers: {
                               glyphed: {
                                   cls: 'trigger-glyph-noop auth-password-trigger'
                               }
                           },
                           allowBlank : false
                       },
                       {
                           xtype: 'textfield',
                           emptyText: 'Repetir Contraseña',
                           cls: 'auth-textbox',
                           inputType: 'password',
                           initialPassField: 'pass',
                           triggers: {
                               glyphed: {
                                   cls: 'trigger-glyph-noop auth-password-trigger'
                               }
                           },
                           name: 'password_confirm',
                           vtype: 'password',
                           allowBlank : false
                       },
                       {
                           xtype: 'button',
                           reference: 'resetPassword',
                           scale: 'large',
                           ui: 'soft-blue',
                           formBind: true,
                           iconAlign: 'right',
                           iconCls: 'x-fa fa-angle-right',
                           text: 'Cambiar Contraseña',
                           listeners: {
                               click: 'changePassword'
                           }
                       },
                       {
                           xtype: 'component',
                           html: '<div style="text-align:right">' +
                               '<a href="#ptz" class="link-forgot-password">'+
                                   'Atrás</a>' +
                               '</div>',
                           /*listeners:{
                               el:{
                                   click:'onGoBack'
                               }
                           }   */ 
                       }
                   ]
               }
           ] 
        });
        me.callParent(arguments);
    }    
});