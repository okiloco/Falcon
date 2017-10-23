Ext.define('Admin.view.wizard.WizardFormModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.wizardformModel',

    data: {
        atBeginning: true,
        atEnd: false
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
    		autoLoad: false,
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
