Ext.define('Admin.store.infraccion.organismoStore', {
    extend: 'Ext.data.Store',
    alias: 'store.organismostore',
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
    },
    sorters: {
        direction: 'ASC',
        property: 'codigo'
    }
});


