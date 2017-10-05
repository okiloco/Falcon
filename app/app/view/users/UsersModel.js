Ext.define('Admin.view.users.UsersModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.users-users',
    data: {
        name: 'Admin'
    },
    stores:{
    	userstore: {
    		model: 'Base',
    		autoLoad: true,
    		pageSize: 20,
    		proxy: {
    			type: 'ajax',
    			url: Constants.URL_USUARIOS,
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
