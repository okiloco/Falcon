Ext.define('Admin.view.wizard.Wizard', {
    extend: 'Ext.panel.Panel',
    xtype: 'wizard-panel',

    requires: [
        'Admin.view.wizard.WizardFormModel',
        'Admin.view.wizard.WizardFormController'
    ],
    layout: 'card',

    viewModel: {
        type: 'wizardformModel'
    },

    controller:'wizardform_c',
    cls: 'wizardone',
    colorScheme: 'blue',
    flex: 1,
    defaults : {
        /*
         * Seek out the first enabled, focusable, empty textfield when the form is focused
         */
        //defaultFocus: 'textfield:not([value]):focusable:not([disabled])',

        defaultButton : 'nextbutton'
    },

    items: [
        {
            xtype: 'form',
            items:[
                {
                    html : '<h2>Bienvenido...</h2><p>Por favor diligencie los siguientes datos para hacer uso de este software.</p>'
                }
            ]
        },
        {
            xtype: 'form',
            defaultType: 'textfield',
            defaults: {
                labelWidth: 90,
                labelAlign: 'top',
                labelSeparator: '',
                submitEmptyText: false,
                anchor: '100%'
            },
            items:[
                {
                    xtype: 'combo',
                    name: 'organismo',
                    fieldLabel: 'Organismo',
                    bind:{
                        store:'{organismostore}'
                    },
                    emptyText:'Selecione Organismo',
                    allowBlank : false,
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'codigo',
                    listeners:{
                        select:function(self, record, eOpts){
                            var form = self.up("form");
                            var camara = form.down("[name=camera_id]");
                            camara.reset();
                            camara.getStore().getProxy().extraParams = record.getData();
                            camara.getStore().load();
                        }
                    }
                },
                {
                    xtype: 'combo',
                    name: 'camera_id',
                    fieldLabel: 'Camara',
                    bind:{
                        store:'{dispositivostore}'
                    },
                    emptyText:'Selecione Dispositivo',
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'codigo',
                    allowBlank : false
                },
                {
                    emptyText : 'IP Camara',
                    name:'camera_ip',
                    allowBlank : false,
                    regex: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                    regexText: 'Debe ser una dirección IP Válida.'
                },{
                    emptyText : 'Usuario',
                    name:'camera_user',
                    allowBlank : false,
                },{
                    emptyText : 'Contraseña',
                    name:'camera_password',
                    id:'camera_password',
                    inputType: 'password',
                    allowBlank : false,
                },
            ]
        },
        {
            xtype: 'form',
            defaultType: 'textfield',
            defaults: {
                labelWidth: 90,
                labelAlign: 'top',
                labelSeparator: '',
                submitEmptyText: false,
                anchor: '100%'
            },
            items:[
                {
                    emptyText : 'Nombre de Usuario',
                    name:'username',
                    allowBlank : false,
                },
                {
                    emptyText : 'Email',
                    vtype: 'email',
                    name:'email',
                    allowBlank : false,
                },
                {
                    emptyText : 'Ingrese contraseña',
                    inputType: 'password',
                    name:'password',
                    cls: 'wizard-form-break',
                    allowBlank : false,
                },
                {
                    emptyText : 'Reingrese constraseña',
                    inputType: 'password',
                    name:'re_password',
                    allowBlank : false,
                },
            ]
        },
        {
            xtype: 'form',
            defaultType: 'textfield',
            defaults: {
                labelWidth: 90,
                labelAlign: 'top',
                labelSeparator: '',
                submitEmptyText: false,
                anchor: '100%'
            },
            items:[
                {
                    emptyText : 'Placa vehiculo',
                    name:'movil_plate',
                    allowBlank : false,
                },
                {
                    emptyText : 'Nombre vehiculo',
                    name:'movil_name',
                    allowBlank : false,
                }
            ]
        },
        {
            xtype: 'form',
            items:[
                {
                    html : '<h2>Enviando datos...</h2><p>Verificando los datos ingresados...</p>'
                }
            ]
        }
    ],

    initComponent: function() {

        this.tbar = {
            reference: 'progress',
            defaultButtonUI: 'wizard-' + this.colorScheme,
            cls: 'wizardprogressbar',
            defaults: {
                disabled: true,
                iconAlign:'top'
            },
            layout: {
                pack: 'center'
            },
            items: [
                {
                    step: 0,
                    iconCls: 'fa fa-info',
                    pressed: true,
                    enableToggle: true,
                    text: 'Bienvenido'
                },
                {
                    step: 1,
                    iconCls: 'fa fa-eye',
                    enableToggle: true,
                    text: 'Camara'
                },
                {
                    step: 2,
                    iconCls: 'fa fa-user',
                    enableToggle: true,
                    text: 'Usuario'
                },
                {
                    step: 3,
                    iconCls: 'fa fa-truck',
                    enableToggle: true,
                    text: 'Movil'
                },
                {
                    step: 4,
                    iconCls: 'fa fa-upload',
                    enableToggle: true,
                    text: 'Finalizar'
                }
            ]
        };

        this.bbar = {
            reference: 'navigation-toolbar',
            margin: 8,
            items: [
                '->',
                {
                    text: 'Volver',
                    ui: this.colorScheme,
                    id:'vol_btn',
                    bind: {
                        disabled: '{atBeginning}'
                    },
                    listeners: {
                        click: 'onPreviousClick'
                    }
                },
                {
                    text: 'Siguiente',
                    ui: this.colorScheme,
                    id:'sig_btn',
                    reference : 'nextbutton',
                    bind: {
                        disabled: '{atEnd}'
                    },
                    listeners: {
                        click: 'onNextClick'
                    }
                },
                {
                    text: 'Finalizar',
                    ui: this.colorScheme,
                    id:'finishButton',
                    hidden: true,
                    formBind: true,
                    reference : 'finishbutton',
                    listeners: {
                        click: 'onFinishClick'
                    }
                }
            ]
        };

        this.callParent();
    }
});