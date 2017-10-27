Ext.define('Admin.view.infraccion.InfraccionModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.infraccion-infraccion',
    data: {
        name: 'Admin'
    },
    stores:{
		infraccionStore: Ext.create('Admin.store.infraccion.infraccionStore'),
		organismostore: Ext.create('Admin.store.infraccion.organismoStore'),
	    dispositivostore: Ext.create('Admin.store.infraccion.dispositivoStore')
    }

});
