/*
	created by: Fabian Vargas F
	date:24/06/2016
	description: Componente personalizado, para realizar filtros.
*/
Ext.define('Admin.utils.com.searchButton', {
	extend: 'Ext.form.field.Text',
	alias: ['widget.searchbutton'],
  cls:'search-field',
	constructor: function(config) {
		var me = this;
		Ext.applyIf(config, {
            triggers: {
                search: {
                   cls: 'x-form-search-trigger',
                   tabIndex :1,
                    handler: (typeof(config.listeners.search)!='undefined'?config.listeners.search:function(){
                    	console.info('Debe definir una funcion en el listener, llamada search, para realizar una acción.');
                    })
                },
                clear: {
                  cls:"x-form-clear-trigger",
                  tabIndex :2,
                   hidden:true,
                   handler: (typeof(config.listeners.clear)!='undefined'?config.listeners.clear:function(self){
                      el.setHidden(true);
                      self.setValue('');    
                    })
               }
            }
		});
		
		me.callParent([config]);
		me.on('change',me.onChange);
	},
	onChange:function(){
		var btn_clear=this.getTrigger('clear');
		btn_clear.setHidden(this.getValue()=='');
	}
});