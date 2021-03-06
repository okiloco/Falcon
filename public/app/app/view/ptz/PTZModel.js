Ext.define('Admin.view.ptz.PTZModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.ptz',
    data: {
        config:null,
        name: 'Falcon',
        camera:{},
        time:0,
        interval:null,
        socket:null,
        playing:false,
        images:[
        ],
    },
    stores:{
    	imagenStore: {
            model: 'Admin.model.image.Image',
            autoLoad: true,
            pageSize: 4,
            infraccion:null,
            data:'{images}',
            proxy: {
                type: 'ajax',
                timeout:600000,
                url: Constants.URL_IMAGES,
                reader: {
                    type:'json',
                    rootProperty:'data',
                },
                actionMethods:{
                    read:'GET'
                },
                extraParams: {
                    estado:0
                }
            },
            listeners: {
                // load: 'onLoadistadoinfraccionrechazadasstore'
            }
        },
        videoStore: {
    		model: 'Admin.model.video.Video',
    		autoLoad: true,
    		pageSize: 4,
            infraccion:null,
			// data:'{images}',
    		proxy: {
    			type: 'ajax',
    			timeout:600000,
    			url: Constants.URL_VIDEOS,
    			reader: {
    				type:'json',
    				rootProperty:'data',
    			},
    			actionMethods:{
    				read:'GET'
    			},
                extraParams: {
                    estado:0
                }
    		},
    		listeners: {
    			load: 'onLoadVideo'
    		}
    	},
    	toolStore: {
    		model: 'Base',
    		autoLoad: false,
			data:'{camera}',
    		listeners: {
    			// load: 'onLoadistadoinfraccionrechazadasstore'
    		}
    	}
    }
});
