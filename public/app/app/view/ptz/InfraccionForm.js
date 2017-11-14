Ext.define('Admin.view.ptz.InfraccionForm',{
    extend: 'Ext.form.Panel',
    alias: ['widget.infraccionform'],
    layout: 'anchor',
    defaults: {
        anchor: '100%'
    },
    buttonAlign:'center', 
    requires: [
        'Admin.view.ptz.InfraccionFormController',
        'Admin.view.ptz.InfraccionFormModel'
    ],

    /*controller: 'ptz-infraccionform',
    viewModel: {
        type: 'ptz-infraccionform'
    },
    */
    items:[
        {
            // Fieldset in Column 1 - collapsible via toggle button
            xtype:'fieldset',
            columnWidth: 0.5,
            border:false,
            title: '<h2>Infracción</h2>',
            collapsible: true,
            defaultType: 'textfield',
            defaults: {anchor: '100%'},
            layout: 'anchor',
            padding: 10,
            items:[
                {
                    xtype: 'textfield',
                    name: 'placa',
                    emptyText: 'Placa',
                    regex: /^((AU){1}|([A-Z]{3})([\d]{3}))+$/,
                    regexText: 'Debe ser una placa Válida.',
                    maxLength:6,
                    allowBlank:false,                    
                    listeners: {
                        change:function(self,newVal,oldVal){
                            self.setValue(newVal.toUpperCase());
                        }
                    }
                },
                {
                    xtype: 'textfield',
                    name: 'direccion',
                    emptyText: 'Dirección',
                    regex: /^((VIA)|(TRV)|(AV)|(CL)|(KR)|(KM)){1}(\s)((\d)+[A-Z]?)+(-)((\d)+[A-Z]?)+$/,
                    regexText: 'Debe ser una dirección Válida.',
                    allowBlank:false,
                    listeners: {
                        change:function(self,newVal,oldVal){
                           self.setValue(newVal.toUpperCase());
                        },
                        specialkey:'onEnter'
                    },
                },
                {
                    xtype:'checkboxfield',
                    boxLabel: 'Confirmar',
                    name: 'estado',
                    value:1,
                    inputValue: '1'
                }
            ]
        }    
    ],
    cls: 'wizardone',
    colorScheme: 'blue',
    buttons:[
        {
            xtype:'button',
            text:'Aceptar',
            name:'confirmar',
            // iconCls:'save-icon',
            formBind:true,                         
            handler:'confirmInfraccion',
        }
        /*{
            xtype:'button',
            text:'Cancelar',
            name:'cancelar',
            // iconCls:'save-icon',
            formBind:true,                         
            handler:'cancelarInfraccion',
            cls: 'ux-action-btn'
        },*/
    ]
    
});