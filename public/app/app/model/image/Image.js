Ext.define('Admin.model.image.Image', {
    extend: 'Admin.model.Base',
    fields:[
        {
        	name:'url', convert:function(val,record){
        		return BASE_PATH+val;
        	},
        	defaultValue:Constants.URL_ICON_IMAGEN_EMPTY
        },
        'creator',
        'filename',
        'id',
        'lote',
        'estado'

    ]
});