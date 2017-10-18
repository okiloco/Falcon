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
                    allowBlank:false
                },
                {
                    xtype: 'textfield',
                    name: 'direccion',
                    emptyText: 'Dirección',
                    allowBlank:false
                }
            ]
        }    
    ],
    buttons:[
        {
            xtype:'button',
            text:'Confirmar',
            name:'confirmar',
            // iconCls:'save-icon',
            formBind:true,                         
            handler:'confirmInfraccion',
            cls: 'ux-action-btn'
        },
        {
            xtype:'button',
            text:'Cancelar',
            name:'cancelar',
            // iconCls:'save-icon',
            formBind:true,                         
            handler:'cancelarInfraccion',
            cls: 'ux-action-btn'
        },
    ]
    
});