Ext.define('Admin.view.wizard.Wizard', {
    extend: 'Ext.panel.Panel',
    xtype: 'wizard-panel',

    requires: [
        'Admin.view.wizard.WizardFormModel',
        'Admin.view.wizard.WizardFormController'
    ],
    layout: 'card',

    viewModel: {
        type: 'wizardform'
    },

    controller:'wizardform_c',
    cls: 'wizardone',
    colorScheme: 'blue',
    flex: 1,
    defaults : {
        /*
         * Seek out the first enabled, focusable, empty textfield when the form is focused
         */
        defaultFocus: 'textfield:not([value]):focusable:not([disabled])',

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
                    xtype:'combo',
                    emptyText : 'Organismo',
                    name:'organismo',
                    id:'organismo',
                    editable:false,
                    store : Ext.create('Ext.data.Store',{
                        fields:['name','value'],
                        data:[
                            {name:'Barranquilla',value:'BQA'}
                            //{name:'Soledad',value:'SOL'},
                            //{name:'Puerto Colombia',value:'PTO'}
                            ]
                    }),
                    displayField:'name',
                    valueField:'value'
                },{
                    xtype:'combo',
                    emptyText : 'Camara',
                    name:'camera_id',
                    id:'camera_id',
                    editable:false,
                    store : Ext.create('Ext.data.Store',{
                        fields:['name','value'],
                        data:[
                            {name:'CZBQ01',value:'CZBQ01'}
                            //{name:'CZBQ02',value:'CZBQ02'},
                            //{name:'CZBQ03',value:'CZBQ03'}
                            ]
                    }),
                    displayField:'name',
                    valueField:'value'
                },{
                    emptyText : 'IP Camara',
                    name:'camera_ip',
                    id:'camera_ip',
                    allowBlank : false,
                },{
                    emptyText : 'Usuario',
                    name:'camera_user',
                    id:'camera_user',
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
                    id:'username',
                    allowBlank : false,
                },
                {
                    emptyText : 'Email',
                    vtype: 'email',
                    name:'email',
                    id:'email',
                    allowBlank : false,
                },
                {
                    emptyText : 'Ingrese contraseña',
                    inputType: 'password',
                    name:'password',
                    id:'password',
                    cls: 'wizard-form-break',
                    allowBlank : false,
                },
                {
                    emptyText : 'Reingrese constraseña',
                    inputType: 'password',
                    name:'re_password',
                    id:'re_password',
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
                    id:'movil_plate',
                    allowBlank : false,
                },
                {
                    emptyText : 'Nombre vehiculo',
                    name:'movil_name',
                    id:'movil_name',
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
                    formBind: true,
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
                    formBind: true,
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