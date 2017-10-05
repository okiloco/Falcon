
Ext.define('Admin.view.users.Users',{
    extend: 'Ext.panel.Panel',
    xtype: 'users',
    requires: [
        'Admin.view.users.UsersController',
        'Admin.view.users.UsersModel'
    ],

    controller: 'users-users',
    viewModel: {
        type: 'users-users'
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
                store:'{userstore}'
            },
            cls: 'user-grid',
            forceFit:true,
            layout:'fit',
            columns:[
                {
                    text:"Usuario",
                    dataIndex:'username'
                },
                {
                    text:"Email",
                    dataIndex:'email'
                },
                {
                    text:"Rol",
                    dataIndex:'{usergroup.name}'
                },
                {
                    xtype: 'actioncolumn',
                    cls: 'content-column',
                    width: 450,
                    items: [
                        {
                            xtype: 'button',
                            iconCls: 'x-fa fa-pencil',
                            tooltip: 'Editar Registro',
                            handler:'onEditar',                       
                        },
                        {
                            xtype: 'button',
                            iconCls: 'x-fa fa-close',
                            tooltip: 'Eliminar Registro',
                            // handler:'onEliminar'
                        }
                    ],
                    cls: 'content-column',
                    // dataIndex: 'bool',
                    text: 'Acciones'                   
                }
            ]
        }
    ]
});
