
Ext.define('Admin.view.infraccion.Infraccion',{
    extend: 'Ext.panel.Panel',
    xtype:'infraccion',
    requires: [
        'Admin.view.infraccion.InfraccionController',
        'Admin.view.infraccion.InfraccionModel'
    ],
    controller: 'infraccion-infraccion',
    viewModel: {
        type: 'infraccion-infraccion'
    },
    layout:{
        type:'fit',
        align:'strech'
    },
    flex:1,
    margin:20,
    cls: 'shadow',
    items:[
        {
            xtype:'grilla',
            bind:{
                store:'{infraccionStore}'
            },
            cls: 'user-grid',
            forceFit:true,
            layout:'fit',
            plugins:[
               Ext.create('Ext.grid.plugin.CellEditing',{
                  clicksToEdit: 2
               })
            ],
            listeners:{
                afterrender:'onRender'
            },
            columns:[
                {
                    dataIndex:"codigo",
                    text:"Codigo",
                    width:150
                },
                {
                    dataIndex:"lote",
                    text:"Lote",
                    width:80
                },
                {
                    dataIndex:"placa",
                    text:"Placa",
                    width:80,
                    editor: Ext.create('Ext.form.field.Text',{
                        emptyText:'Placa',
                        name:'placa',
                        regex: /^((AU){1}|([A-Z]{3})([\d]{3}))$/,
                        regexText: 'Debe ser una placa Válida.',
                        selectOnFocus: true,
                        listeners: {
                            specialkey:'onSaveEnter'
                        }
                    })
                },
                {
                    dataIndex:"direccion",
                    text:"Direccion",
                    width:250,
                    editor: Ext.create('Ext.form.field.Text',{
                        emptyText:'Dirección',
                        name:'direccion',
                        regex: /^((VIA)|(TRV)|(AV)|(CL)|(KR)|(KM)){1}(\s)((\d)+[A-Z]?)+(-)((\d)+[A-Z]?)+$/,
                        regexText: 'Debe ser una dirección Válida.',
                        selectOnFocus: true,
                        listeners: {
                            specialkey:'onSaveEnter'
                        }
                    })  
                },
                {
                    dataIndex:"dispositivo",
                    text:"Dispositivo"
                },
                /*{
                    dataIndex:"lat",
                    text:"Lat"
                },
                {
                    dataIndex:"long",
                    text:"Long"
                },*/
                {
                    dataIndex:"username",
                    text:"User"
                },
                {
                    dataIndex:"estado_desc",
                    text:"Estado"
                },
                {
                    dataIndex:"fecha",
                    text:"Fecha"
                },
                {
                    xtype: 'actioncolumn',
                    cls: 'content-column',
                    align:'center',
                    width: 450,
                    items: [
                        {
                            xtype: 'button',
                            iconCls: 'x-fa fa-ban fa-upload',
                            tooltip: 'Subir Infracción',
                            align:'center',
                            handler:'upload',                       
                        },
                        {
                            xtype: 'button',
                            iconCls: 'x-fa fa-pencil fa-eye',
                            tooltip: 'Ver evidencias',
                            align:'center',
                            handler:'evidencias'                     
                        }
                    ],
                    cls: 'content-column',
                    text: 'Acciones'                   
                }
             ],
             dockedItems:[
                 {
                     xtype:"toolbar",
                     items:[
                        {
                            xtype: 'combo',
                            name: 'organismo',
                            bind:{
                                store:'{organismostore}'
                            },
                            allowBlank : false,
                            queryMode: 'local',
                            displayField: 'name',
                            valueField: 'codigo',
                            emptyText:'Organismo',
                            listeners:{
                                select:function(self, record, eOpts){
                                    var toolbar = self.up("toolbar");
                                    var camara = toolbar.down("[name=dispositivo]");
                                    camara.reset();
                                    camara.getStore().getProxy().extraParams = record.getData();
                                    camara.getStore().load();
                                }
                            }
                        },
                        {
                            xtype: 'combo',
                            name: 'dispositivo',
                            emptyText:'Dispositivo',
                            bind:{
                                store:'{dispositivostore}'
                            },
                            queryMode: 'local',
                            displayField: 'name',
                            valueField: 'codigo',
                            allowBlank : false
                        },
                        {
                            xtype: 'textfield',
                            name: 'placa',
                            emptyText: 'Placa'
                        },
                        {
                            xtype: 'textfield',
                            name:"lote",
                            emptyText:"Lote"
                        },
                        {
                           xtype: 'button',
                           text: 'Filtrar',
                           name: 'filtrar',
                           handler:'search'
                        },
                        {
                           xtype: 'button',
                           text: 'Limpiar',
                           name: 'limpiar',
                           handler:'limpiar'
                        },
                        '->',
                        {
                           xtype: 'button',
                           enableToggle: true,
                           iconCls:'x-fa fa-refresh',
                           ui: 'header',
                           listeners:{
                               toggle:'onToggleSync'
                           },
                           tooltip: 'Sincronización Automática'
                        }
                     ]
                 }
             ],
             listeners:{
                scope:this,
                cellkeydown:function( self, td, cellIndex, record, tr, rowIndex, e, eOpts ){
                    var grid = self.up("grid");
                    record.set("changed",(!(record.get("changed"))));
                    console.log(record.get("changed"));
                }
             }             
        }
     ] 
});
