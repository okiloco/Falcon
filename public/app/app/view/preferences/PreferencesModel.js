Ext.define('Admin.view.preferences.PreferencesModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.preferences-preferences',
    data: {
        name: 'Admin'
    },
    stores:{
    	organismostore: Ext.create('Admin.store.infraccion.organismoStore'),
        dispositivostore: Ext.create('Admin.store.infraccion.dispositivoStore')
    }
});
