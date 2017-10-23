Ext.define('Admin.view.preferences.PreferencesModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.preferences-preferences',
    data: {
        name: 'Admin'
    },
    stores:{
    	organismostore: {
    		model: 'Admin.model.Base',
    		storeId: 'organismoStore',
    		autoLoad: true,
    		pageSize: 20,
    		proxy: {
    			type: 'ajax',
    			url: Constants.URL_ORGANISMOS,
    			reader: {
    				type:'json',
    				rootProperty:'data',
    			},
    			actionMethods:{
    				read:'GET'
    			}
    		},
    		listeners: {
    			// load: 'onLoadistadoinfraccionrechazadasstore'
    		}
    	},
        dispositivostore: {
            model: 'Admin.model.Base',
            storeId: 'organismoStore',
            autoLoad: true,
            pageSize: 20,
            proxy: {
                type: 'ajax',
                url: Constants.URL_DISPOSITIVOS,
                reader: {
                    type:'json',
                    rootProperty:'data',
                },
                actionMethods:{
                    read:'GET'
                }
            },
            listeners: {
                // load: 'onLoadistadoinfraccionrechazadasstore'
            }
        }
    }
});
