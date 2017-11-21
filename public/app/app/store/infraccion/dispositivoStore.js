Ext.define('Admin.store.infraccion.dispositivoStore', {
    extend: 'Ext.data.Store',
    alias: 'store.dispositivostore',
    model: 'Admin.model.Base',
    storeId: 'dispositivostore',
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
});


