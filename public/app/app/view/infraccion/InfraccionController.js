Ext.define('Admin.view.infraccion.InfraccionController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.infraccion-infraccion',
    search:function(self){
    	var grid=self.up("grid"),
    	params={},
    	toolbar=grid.down('toolbar[dock=top]'),
    	valid=true;
    	Ext.Array.each(toolbar.query('field'),function(item,index){
    		/*if(!item.isValid()){
    			valid=false;
    		}*/
    		if(item.getSubmitValue()!=null && item.getSubmitValue()!=''){
    			params[item.name]=item.getSubmitValue();
    		}
    	});
    	if(valid){
    		params["estado"] = 0;
    		grid.getStore().getProxy().extraParams=params;
    		grid.getStore().loadPage(1);
    	}else{
    		Ext.Msg.show({
    		    title: 'Atención',
    		    msg: 'Algunos campos son requeridos.',
    		    buttons: Ext.Msg.OK,
    		    icon: Ext.Msg.WARNING                    
    		});
    	}
    },
    limpiar:function(self){
    	var grid=self.up("grid"),
    	params={},
    	toolbar=grid.down('toolbar[dock=top]');
    	Ext.Array.each(toolbar.query('field'),function(item,index){
    	    item.reset();
    		params[item.name]=item.getValue();
    	});
    	grid.getStore().getProxy().extraParams=params;
    	// grid.getStore().loadPage(1);
    	grid.getStore().removeAll();
    },
    upload:function(grid, rowIndex, colIndex){
    	var record = grid.getStore().getAt(rowIndex);
        console.log("Se va a subir. ",record.getData())
        record.save({
            callback: function(record, operation, success) {
                var responseObject = Ext.decode(operation.getResponse().responseText);
                // do something whether the save succeeded or failed
                if(!success){
                    Ext.Msg.show({
                        title: 'Atención',
                        msg: responseObject.msg,
                        buttons: Ext.Msg.OK,
                        icon: Ext.Msg.ERROR                    
                    });
                }else{
                    var infraccion = responseObject.infraccion;
                    var params = infraccion;
                    console.log(infraccion);
                    //Msg.info(responseObject.msg);

                    grid.getStore().reload();
                }
            }
        });
    },
    onSaveEnter:function(self, e){
       var me =this;
       if (e.getKey() == e.ENTER) {
         me.update(self,e);
       }
    },
    update:function(self,e){ 
       var grid = self.up("grid");
       var store = grid.getStore();
       var records=store.getUpdatedRecords();
       if(records.length>0){
           var record = records[0];
           record.set(self.name,self.getValue()); 
           record.save({
               callback: function(record, operation, success) {
                   var responseObject = Ext.decode(operation.getResponse().responseText);
                   // do something whether the save succeeded or failed
                   if(!success){
                       Ext.Msg.show({
                           title: 'Atención',
                           msg: responseObject.msg,
                           buttons: Ext.Msg.OK,
                           icon: Ext.Msg.ERROR                    
                       });
                   }else{
                       var infraccion = responseObject.infraccion;
                       var params = infraccion;
                       console.log(infraccion);
                       //Msg.info(responseObject.msg);

                       grid.getStore().reload();
                   }
               }
           });
       }
    }
});
