Ext.define('Admin.view.pages.ErrorPage', {
    extend: 'Admin.view.pages.ErrorBase',
    xtype: 'error',

    requires: [
        'Ext.container.Container',
        'Ext.form.Label',
        'Ext.layout.container.VBox',
        'Ext.toolbar.Spacer'
    ],

    items: [
        {
            xtype: 'container',
            width: 600,
            cls:'error-page-inner-container',
            layout: {
                type: 'vbox',
                align: 'center',
                pack: 'center'
            },
            items: [
                {
                    xtype: 'label',
                    cls: 'error-page-top-text',
                    text: (global.ERROR!=undefined)?(global.ERROR.title):"Opps!"
                },
                {
                    xtype: 'label',
                    cls: 'error-page-desc',
                    html: "<div><h2 style=\"color:#fff;\">"+((global.ERROR!=undefined)?global.ERROR.message:"Algo salió mal.")+"</h2></div>"+
                          "<div>Reintentar <a href=\"javascript:location.reload();\"> Recargar </a></div>"
                },
                {
                    xtype: 'tbspacer',
                    flex: 1
                }
            ]
        }
    ]
});
