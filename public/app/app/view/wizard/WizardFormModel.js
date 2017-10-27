Ext.define('Admin.view.wizard.WizardFormModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.wizardformModel',

    data: {
        atBeginning: true,
        atEnd: false
    },
    stores:{
	    organismostore: Ext.create('Admin.store.infraccion.organismoStore'),
        dispositivostore: Ext.create('Admin.store.infraccion.dispositivoStore')
    }
});
