Ext.define('Admin.store.infraccion.infraccionStore', {
    extend: 'Ext.data.Store',
    alias: 'store.infraccionstore',
    storeId: 'infraccionStore',
	model: 'Admin.model.infraccion.Infraccion',
	autoLoad: true,
	pageSize: 20,
	proxy: {
		type: 'ajax',
		url: Constants.URL_INFRACCIONES,
		reader: {
			type:'json',
			rootProperty:'data',
		},
		actionMethods:{
			read:'GET'
		},
		extraParams: {
		    "estado":0,
		    "lote":Ext.Date.format(new Date(),"Ymd"),
		    "organismo":global.config.organismo,
		    "dispositivo":global.config.camera_id
		}
	},
	listeners: {
		// load: 'onLoadistadoinfraccionrechazadasstore'
	}
});
