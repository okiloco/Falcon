
Ext.define('Admin.view.ptz.PTZ',{
    extend: 'Ext.panel.Panel',
    xtype: 'ptz',
    requires: [
        'Admin.view.ptz.PTZController',
        'Admin.view.ptz.PTZModel',
        'Admin.view.ptz.InfraccionForm',
        'Admin.socket.Socket'
    ],
    reference:'ptzpanel',    
    flex:1,
    height:600,
    layout: {
        type:'border',
    },
    margin:20,
    scrollable:false,
    autoScroll:false,
    cls: 'shadow',
    defaults:{
        scrollable:false,
        autoScroll:false
    },
    bodyPadding:5,
    controller: 'ptz',
    viewModel: {
        type: 'ptz'
    },
    items:[
        {
            xtype:'panel',
            region:'center',
            layout:'vbox',
            items:[
                {
                    xtype:'dataview',
                    name:'viewer',
                    cls:'viewer',
                    flex:.8,
                    itemSelector: 'div.viewer-tools .item',
                    bind:{
                        store:'{toolStore}',
                    },
                    tpl: new Ext.XTemplate(
                        '<div class="viewer-tools">',
                        '<div id="recIndicator" class="rec recIndicator-hidden">',
                           '<div class="sign">',
                            '<span id="timer">Grabando</span>',
                            '<span class="circle"></span>',
                           '</div>',
                        '</div>',
                        '<tpl for=".">',
                            '<div class="item">',
                                '<span class="text">{text}</span>',
                            '</div>',
                            '<img src="{image}" style="width:100%; height:100%;" frameborder="0"/>',
                        '</tpl>',
                        '</div>',
                        '<div id="imageviewer" class="image">',
                            '<img src="'+Constants.URL_VIEWER+'" style="width:100%; height:100%;" frameborder="0"/>',
                        '</div>',
                        '<div class="viewer-footer">',
                            '<span id="timer">{time}</span>',
                        '</div>'
                    )
                },
                {
                    xtype:'dataview',
                    name:'video_viewer',
                    cls:'video_viewer',
                    flex:.2,
                    itemSelector: 'div.video_viewer .item',
                    layout:'hbox',
                    bind:{
                        store:'{videoStore}',
                    },
                    tpl: new Ext.XTemplate(
                        '<div class="video_viewer">',
                            '<tpl for=".">',
                                '<div class="item">',
                                    '<video width="150" height="80" controls>',
                                        '<source src="http://localhost:3000/app/video/preview?id={id}" type="video/mp4">',
                                    '</video>',
                                '</div>',
                            '</tpl>',
                        '</div>',
                        '<div class="video_viewer-footer">',
                        '</div>'
                    )
                }
            ]
        },
        {
            xtype:'panel',
            layout:'vbox',
            region:'east',
            flex:.3,
            defaults:{
               width:'100%'
            },
            items:[
                {
                    xtype:'dataview',
                    name:"captureimages",
                    cls:'preview',
                    flex:.5,
                    itemSelector: 'div.thumb-wrap',
                    emptyText: 'No se han capturado fotografias',
                    bind:{
                        store:'{imagenStore}'
                    },
                    layout:{
                        type:'hbox',
                        pack:'center'
                    },
                    tpl:new Ext.XTemplate(
                        '<h2>Vista previa</h2>',
                        '<tpl for=".">',
                            '<div style="margin-bottom: 10px;" class="thumb-wrap">',
                              /*'<input class="check x-form-type-checkbox" type="checkbox" name="vehicle" value="Bike"><span>Imagen Principal</span></input>',*/
                              '<img class="image {[this.getClass(values)]}" src="{url}" />',
                            '</div>',
                        '</tpl>',
                        {
                            getClass:function(values){
                                return values.iconCls;
                            }
                        }
                    ),
                    listeners:{
                        itemclick:'itemClick'
                    }
                },
                {
                    xtype:'infraccionform',
                    flex:.5,
                }
            ]
        }
    ],
    dockedItems:[
        {
            xtype:'toolbar',
            dock:'top',
            defaults:{
                listeners:{
                    toggle:'onToggle',
                    click:'onRecorVideo',
                    playing:'onPlaying'
                }
            },
            items:[
                {
                    xtype: 'button',
                    text: 'Nueva <br> Infracción',
                    iconCls:'fa fa-hand-paper-o',
                    iconAlign: 'top',
                    name: 'infraccion',
                    handler:'newInfraccion'
                },
                {
                    xtype: 'button',
                    text: 'Capturar <br> Nueva Imagen',
                    iconCls:'fa fa-camera',
                    iconAlign: 'top',
                    name: 'capture',
                    handler:'capturarImagen'
                },
                {
                    xtype: 'button',
                    text: 'Iniciar <br> Grabación',
                    iconCls:'fa fa-video-camera',
                    iconAlign: 'top',
                    enableToggle: true,
                    name: 'grabar'
                },
                {
                    xtype: 'button',
                    text: 'Grabar 8<br>  segundos',
                    iconCls:'fa fa-video-camera',
                    enableToggle: true,
                    iconAlign: 'top',
                    name: '8segundos'
                }
                /*,'->',
                {
                    xtype: 'button',
                    tooltip: 'Salir',
                    iconCls: 'fa fa-sign-out',
                    name: 'logout'
                },*/

            ]
        },
        {
            xtype:'toolbar',
            dock:'bottom',
            layout: {
                pack: 'left'
            },
            items:[
                {
                    xtype: 'button',
                    tooltip: 'Capturar <br> Nueva Imagen',
                    iconCls:'fa fa-camera',
                    name: 'capture',
                    handler:'capturarImagen'
                },
                {
                    xtype: 'button',
                    tooltip: 'Detener<br>Grabación',
                    iconCls:'fa fa-stop',
                    name: 'stop'
                }
            ]
        }
    ],
    listeners:{
        render:'onRender',
        // beforerender:'beforeRender'
    }
});

