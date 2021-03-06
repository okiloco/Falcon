
Ext.define('Admin.view.infraccion.Infraccion',{
    extend: 'Ext.panel.Panel',
    xtype:'infraccion',
    requires: [
        'Ext.form.field.Date',
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
                        regex: /^((AU){1}|((VIA)|(TRV)|(AV)|(CL)|(KR)|(KM)){1}(\s)((\d)+[A-Z]?)+(-)((\d)+[A-Z]?))+$/,
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
                            getClass:function(val,meta,record){
                                var estado = (record.get("estado")==1);
                                return (estado)?"x-hide-display":"x-grid-center-icon x-fa fa-ban fa-upload";
                            }                       
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
                            xtype: 'hiddenfield',
                            name: 'organismo',
                            value:global.config.organismo
                        },
                        {
                            xtype: 'hiddenfield',
                            name: 'dispositivo',
                            value:global.config.camera_id
                        },
                        {
                            xtype: 'textfield',
                            name: 'placa',
                            emptyText: 'Placa'
                        },
                        {
                            xtype: 'datefield',
                            name: 'lote',
                            allowBlank : false,
                            format:'Ymd',
                            dateFormat:'Ymd',
                            submitFormat:'Ymd',
                            emptyText: 'Lote',
                            value:new Date()
                        },
                        {
                            xtype:'checkboxfield',
                            boxLabel: 'Subidos',
                            name: 'estado',
                            inputValue: '1'
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
                cellkeydown:function( self, td, cellIndex, record, tr, rowIndex, e, eOpts ){
                    var grid = self.up("grid");
                    record.set("changed",!record.get("changed"));
                    console.log(record.get("changed"));
                },
                afterrender:function(self){
                    var toolbar = self.down("toolbar[dock=top]");
                    var organismo = toolbar.down("[name=organismo]");
                    var dispositivo = toolbar.down("[name=dispositivo]");
                    
                    organismo.setValue(global.config.organismo);
                    dispositivo.setValue(global.config.camera_id);
                }
            }             
        }
     ] 
});
