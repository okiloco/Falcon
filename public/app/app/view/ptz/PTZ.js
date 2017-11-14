
Ext.define('Admin.view.ptz.PTZ',{
    extend: 'Ext.panel.Panel',
    xtype: 'ptz',
    id:'ptz-panel',
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
            id:'ptz-container',
            flex:1,
            listeners:{
                click:function(e){
                    console.log(e)
                }
            },
            items:[
                {
                    xtype:'dataview',
                    name:'viewer',
                    cls:'viewer',
                    layout:'hbox',
                    flex:.8,
                    itemSelector: 'div.viewer-tools .item',
                    bind:{
                        store:'{toolStore}',
                    },
                    width:'100%',
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
                        '<div id="imageviewer">',
                            '<div id="videopreview" class="videopreview videopreview-hidden">',
                                '<div id="closevideo"><i class="x-fa fa fa-close" aria-hidden="true"></i></div>',
                                '<video controls  width="100%" height="100%">',
                                    '<source src="" type="video/mp4">',
                                '</video>',
                            '</div>',
                            '<img id="imgpreview" class="imgpreview imgpreview-hidden" src="" style="width:100%; height:100%;" frameborder="0"/>',
                            '<div class="campreview">',
                                '<img src="'+Constants.URL_VIEWER+'" style="width:100%; height:100%;" frameborder="0"/>',
                            '</div>',
                        '</div>',
                        '<div class="viewer-footer">',
                            '<span id="timer">{time}</span>',
                        '</div>'
                    )
                },
                {
                    xtype:'panel',
                    layout:'fit',
                    collapseible:true,
                    hideCollapseTool:true,
                    titleCollapse:false,
                    width:"100%",
                    flex:.2,
                    collapseMode:'mini',
                    items:[
                        {
                            xtype:'dataview',
                            name:'video_viewer',
                            cls:'video_viewer_container',
                            itemSelector: 'div.video_viewer .item #play',
                            layout:'hbox',
                            bind:{
                                store:'{videoStore}',
                            },
                            loadingUseMsg:false,
                            scrollable:'horizontal',    
                            tpl: new Ext.XTemplate(
                                '<div class="video_viewer">',
                                    '<div class="container">',
                                        '<tpl for=".">',
                                            '<div class="item" id={id}>',
                                                '<video width="150" height="80" class="video-player">',
                                                    '<source src="http://localhost:3000/app/video/preview?id={id}" type="video/mp4">',
                                                '</video>',
                                                '<div id="play">',
                                                    '<i class="fa fa-play-circle" aria-hidden="true"></i>',
                                                '</div>',
                                            '</div>',
                                        '</tpl>',
                                    '</div>',
                                '</div>',
                                '<div class="video_viewer-footer">',
                                '</div>'
                            ),
                            listeners:{
                                itemclick:'onPlayVideo'
                            }
                        }
                    ]
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
                    click:'onRecorVideo',
                    toggle:'onToggle',
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
                    tooltip:'Nueva Infracción<br>(CTRL+N)',
                    handler:'newInfraccion'
                },
                {
                    xtype: 'button',
                    text: 'Capturar <br> Nueva Imagen',
                    tooltip:'Capturar Nueva Imagen<br>(CTRL+C)',
                    iconCls:'fa fa-camera',
                    iconAlign: 'top',
                    name: 'capture',
                    listeners:{
                        click:'capturarImagen'
                    }
                },
                {
                    xtype: 'button',
                    text: 'Iniciar <br> Grabación',
                    tooltip:'Iniciar Grabación<br>(CTRL+I)',
                    iconCls:'fa fa-video-camera',
                    iconAlign: 'top',
                    enableToggle: true,
                    name: 'grabar'
                },
                {
                    xtype: 'button',
                    text: 'Grabar 8<br>  segundos',
                    tooltip:'Grabar 8 segundos<br>(CTRL+O)',
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

