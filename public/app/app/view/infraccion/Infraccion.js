
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
            /*listeners:{
                select :function( self, record, index, eOpts){
                    console.log(record);  
                } 
            },*/
            columns:[
                {
                    dataIndex:"codigo",
                    text:"Codigo"
                },
                {
                    dataIndex:"lote",
                    text:"Lote"
                },
                {
                    dataIndex:"placa",
                    text:"Placa",
                    width:150,
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
                    width: 450,
                    items: [
                        {
                            xtype: 'button',
                            iconCls: 'fa fa-upload',
                            tooltip: 'Subir Infracción',
                            handler:'upload',                       
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
                        }
                     ]
                 }
             ],
             listeners:{
                scope:this,
                cellkeydown:function( self, td, cellIndex, record, tr, rowIndex, e, eOpts ){
                    var grid = self.up("grid");
                    record.set("changed",(!record.get("changed")));
                    console.log(record.get("changed"));
                }
             }             
        }
     ] 
});
