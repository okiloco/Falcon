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

        grid.getStore().removeAt(rowIndex);

        record.save({
            callback: function(record, operation, success) {
                var responseObject = Ext.decode(operation.getResponse().responseText);
                // do something whether the save succeeded or failed
                if(!responseObject.success){
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

                }
            }
        });
    },
    evidencias:function(grid, rowIndex, colIndex){
    	var record = grid.getStore().getAt(rowIndex);

      Ext.create('Ext.window.Window', {
          title: 'Vista previa',
          height: 600,
          width: 800,
          layout: 'fit',
          modal: true,
          constrainHeader: true,
          resizable: false,
          maximizable: false,
          bodyCls:'iframe-win',
          bodyStyle: "padding-right:5px;padding-left:5px;",
          items : [
            Ext.create('Admin.view.infraccion.Evidencia',{
              record:record
            })
          ],
          listeners:{
            afterrender:function(self){
              console.log(self);
            }
          }
      }).show();

    },
    onSaveEnter:function(self, e){
       var me =this;
       if (e.getKey() == e.ENTER) {
        if(self.isValid()){
          me.update(self,e);
        }else{
          Ext.Msg.show({
              title: 'Atención',
              msg: 'Debe digitar un valor válido para este campo.',
              buttons: Ext.Msg.OK,
              icon: Ext.Msg.INFO                    
          });
        }
       }
    },
    update:function(self,e){ 
       var grid = self.up("grid");
       var store = grid.getStore();
       var records=store.getUpdatedRecords();
       if(records.length>0){
           var record = records[0];
           record.set(self.name,self.getValue());

           record["estado"] = 0; 
           console.log("-->Id::",record.get("id"));



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
                       Msg.info(responseObject.msg);

                       grid.getStore().reload();
                   }
               }
           });
       }
    },
    onRender:function(self){
      socket.on("uploaded",function(id){ 
        self.getStore().reload();
        console.log("uploaded ",id);
      });
      self.getStore().loadPage(1);

      grid.getStore().on("update",function(store, record, operation, modifiedFieldNames, details, eOpts ){
        console.log(record);
      }); 


      socket.on("uploaded",function(msg){
        try{
          // var grid = Ext.widget('infraccion').down("grid");
          Msg.info(msg);
          grid.getStore().reload();
        }catch(err){
          console.log(err);
        }
      });
    },
    onToggleSync:function(self, pressed, eOpts){
       global["sync"] = pressed;
       console.log("sync: ",pressed);
       try{
            socket.emit("onsync",pressed);   
       }catch(err){
            console.log("Error Socket: ",err);        
       }
    }
});
