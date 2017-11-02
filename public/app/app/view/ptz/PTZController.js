Ext.define('Admin.view.ptz.PTZController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.ptz',
    capturarImagen:function(self,e,eOpts){
        var vm = this.getViewModel();
        var panel = self.up("ptz");
        var form = panel.down("infraccionform");
        var infraccion = vm.get("infraccion");
        var captureimages = form.up("panel")
        .down("[name=captureimages]");

        if(captureimages.getStore().getCount()<Constants.MAX_CAPTURES){
            Ext.Ajax.request({
                scope: this,
                url: Constants.URL_CAPTURAR_IMAGEN,
                params: {
                    
                },
                success: function(response) {
                    var responseObject = Ext.decode(response.responseText)
                    Msg.info(responseObject.msg);
                    captureimages.getStore().reload();
                },
                failure: function(response) {
                    Ext.Msg.show({
                        title: 'Error',
                        msg: 'Error al procesar la petición.',
                        buttons: Ext.Msg.OK,
                        icon: Ext.Msg.ERROR
                    });
                }
            });
        }else{
            Ext.Msg.show({
                title: 'Atención',
                msg: 'Solo puede capturar '+Constants.MAX_CAPTURES+' imagenes.',
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.INFO                    
            });
        }
    },
    setImage:function(){

    },
    recordVideo:function(btn,params,playing){

	   var me = this;
	   var vm = me.getViewModel();
	   var timer = Ext.fly('timer');
       var panel = btn.up("ptz");
       var dataview_videos = panel.down("[name=video_viewer]");

		if(params.duration!=undefined){
			var seg = params.duration;
			vm.set("time",seg);
			timer.setHtml("Grabando "+seg+"s");
			
			//Disparar Evento playing
			btn.fireEvent("playing",btn,playing);
			var interval = setInterval(function(){ 
				seg--;
				playing = (seg>=0);
				vm.set("playing",playing);
				
				if(!playing){
					timer.setHtml("");
					me.stopVideo(btn,playing);
				}else{
					vm.set("time",seg);
				}
				timer.setHtml("Grabando "+vm.get("time")+"s");
				//Disparar Evento playing
				btn.fireEvent("playing",btn,playing);
			}, 1000);
			vm.set("interval",interval);
		}else{
			vm.set("playing",playing);
			btn.fireEvent("playing",btn,playing);
			timer.setHtml("Grabando ");
		}

		Ext.create('Ext.form.Panel', {
	       standardSubmit: false
	    }).getForm().submit({
	       url: Constants.URL_GRABAR_VIDEO,
	       method:'GET',
	       params:params,
	       success: function(form, action) {
	       		console.log("Video terminado. ",playing,btn.name);
            global.socket.on("video-convert",function(params){ 
              dataview_videos.getStore().reload();
            });
            dataview_videos.getStore().reload();
	       		Msg.info(action.result.msg);
           },
           failure: function(form, action) {
               switch (action.failureType) {
                   case Ext.form.action.Action.CLIENT_INVALID:
                       Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
                       break;
                   case Ext.form.action.Action.CONNECT_FAILURE:
                       Ext.Msg.alert('Failure', 'Ajax communication failed');
                       break;
                   case Ext.form.action.Action.SERVER_INVALID:
	                  me.stopVideo(btn,false);	
	                  Ext.Msg.show({
	                      title: 'Error',
	                      msg: action.result.msg,
	                      buttons: Ext.Msg.OK,
	                      icon: Ext.Msg.ERROR,
	                      fn:me.clearSesion                    
	                  });
              }
           }
	    });
		console.log("Grabar video",params);
    },
    clearSesion:function(){
    	localStorage.clear();
    	location.reload();
    },
    stopVideo:function(self,playing){
    	var me =this,
    	sign= Ext.fly("recIndicator");
    	var vm = this.getViewModel();

    	console.log("Detener Video.",playing);
    	// if(vm.set("playing")){
	    	vm.set("playing",false);
	    	Ext.Ajax.request({
	    		scope: this,
	    		method:'GET',
	    		url : Constants.URL_DETENER_VIDEO,
	    		success: function(response) {
	    			var responseObject = Ext.decode(response.responseText);
	    			me.enableButtons(self,playing,true);
	    			//Disparar Evento playing
	    			self.fireEvent("playing",self,playing);
	    		},
	    		failure: function(response) {
	    			me.stopVideo(self,playing);
	    		}
	    	});
    	// }
    },
    onPlaying:function(self,playing){

      var sign= Ext.fly("recIndicator");
  		var vm = this.getViewModel();
  		vm.set("playing",playing);

    	if(playing){
			   console.log(vm.get("time"));
    		   sign.removeCls("recIndicator-hidden");
    	}else{
    		   sign.addCls("recIndicator-hidden");
			  clearInterval(vm.get("interval"));
    	}
    },
    onToggle:function(self, pressed, eOpts){
    	console.log("onToggle: ",pressed);
    },
    onRecorVideo:function(self, e, eOpts){

    	var vm = this.getViewModel();
    	var pressed = self.pressed;
    	
        var panel = self.up("ptz");
        var dataview_videos = panel.down("[name=video_viewer]");


        console.log("GRABAR VIDEO!",self.name)
        if(dataview_videos.getStore().getCount()<Constants.MAX_CAPTURES){
                if(self.enableToggle){
                    //Habilitar Botones
                    this.enableButtons(self,pressed);
                    if(pressed){
                       var params ={action:"record"};
                        switch(self.name){
                          case '8segundos':
                             params["duration"] = 8;
                             self["mode"] = 'auto';
                          break;
                          case 'grabar':
                             console.log(self.name);
                          break;
                        }
                        if(!vm.get("playing")){
                           this.recordVideo(self,params,pressed);
                        }
                    }else{
                       this.stopVideo(self,pressed);
                       return false;
                    }
                } 
        }else{
            Ext.Msg.show({
                title: 'Atención',
                msg: 'Solo puede grabar '+Constants.MAX_REC+' videos.',
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.INFO                    
            });
        }
    },
    enableButtons:function(self,pressed,all){
    	var view = this.getView();
    	all = all || false;

	 	Ext.Array.each(view.down("toolbar[dock=top]").query("button"), function(btn, index, total) {
	 		if(!all){
		 		if(btn.enableToggle && btn !=self){
	    	      btn.setDisabled(pressed);
		 		}
		 	}else{
		 		if(btn.enableToggle){
		 			btn.setDisabled(pressed);
		 			btn.toggle(pressed);
		 		}
		 	}
	    });
    },
    newInfraccion:function(self){
    	var vm = this.getViewModel();
    	var panel = self.up("ptz");
    	var form = panel.down("infraccionform");
    	var infraccion = vm.get("infraccion");
    	var captureimages = form.up("panel").down("[name=captureimages]");

    	if(captureimages.getStore().getCount()>0){
    		Ext.Msg.show({
    		    title: 'Atención',
    		    msg: 'Hay evidencias sin confirmar.<br>Por favor apruebe o cancele las evidencias, antes de continuar.',
    		    buttons: Ext.Msg.OK,
    		    icon: Ext.Msg.INFO                    
    		});
    	}else{
    		captureimages.getStore().removeAll();
    		vm.set("infraccion",null);
    		form.reset();
    	}

    },
	confirmInfraccion:function(self){
    	var vm = this.getViewModel();
    	var panel = self.up("ptz");
    	var form = panel.down("infraccionform");
    	var params = form.getForm().getFieldValues();
    	var infraccion = vm.get("infraccion") || Ext.create('Admin.model.infraccion.Infraccion',params);
    	var dataview_images = form.up("panel").down("[name=captureimages]");
      var dataview_videos = panel.down("[name=video_viewer]");
    	
        if(dataview_images.getStore().getCount()>0 && dataview_videos.getStore().getCount()>0){

          console.log(infraccion.getData());
        	infraccion.save({
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

                  dataview_images.getStore().reload();
                  dataview_videos.getStore().reload();
                  form.getForm().reset();
    		        }
    		    }
    		});
        }else{
            Ext.Msg.show({
                title: 'Atención',
                msg: 'Debe tomar evidencias de video e imagenes.',
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.ERROR                    
            });
        }
    },
    cancelarInfraccion:function(self){
    	Ext.Msg.confirm('Atención', 'Desea cancelar la Infraccion<br>Se borraran todas las evidencias actuales.', function(buttonId, text, v) {
    		if(buttonId == 'yes') {
    			console.log("Eliminar Videos e Imagenes con Estado 0");
    		}
    	}, this);
    },
    onRender:function(self){
    	// global.IP_CAMERA = camera.camera_ip+"/mjpg/video.mjpg";
    	console.log(global.IP_CAMERA);
      /*var socket = Ext.create("Admin.socket.Socket");
      socket.connect(function(){
      });*/
      global.socket.on("video-not-found",function(id){ 
        var video = Ext.fly(id);
        video.addCls("video-not-found");
      });
    },
    itemClick:function(dataview, record, item, index, e, eOpts){
    	var el = e.target;
    	var me = this;
    	console.log(record);

    	var vm = this.getViewModel();
    	var panel = dataview.up("ptz");
    	var viewer = panel.down("[name =viewer]");
    	vm.set("camera",{"image":record.get("url")});
    	viewer.refresh();

    	Ext.create('Ext.menu.Menu', {
    	    // width: 270,
    	    margin: '10px 10px 10px 0px',
    	    cls:'x-menu action-tools',
    	    padding:'0',
    	    bodyStyle:'border-radius:7px;',
    	    frame:false,
    	    plain:true,
    	    layout:{
    	    	type:'hbox'
    	    },
    	    defaults:{
    	        pakcage:'center',
    	        cls:'item-menu',
    	        xtype:'menuitem',
    	        scope:me,
    	        width:'auto'
    	    },
    	    items: [
    	    {
    	        text: 'Eliminar',
    	        iconCls:'fa fa-trash',
    	        handler:function(){
    	        	var vm = this.getViewModel();
    	        	Ext.Msg.confirm('Atención', 'Desea Eliminar la Imagen?', function(buttonId, text, v) {
    	        		if(buttonId == 'yes') {
    	        			Ext.Ajax.request({
    	        				scope: this,
    	        				url: Constants.URL_IMAGES,
    	        				method:"DELETE",
    	        				params: {
    	        					id:record.get("id")
    	        				},
    	        				success: function(response) {
    	        					var responseObject = Ext.decode(response.responseText);
    	        					Msg.info(responseObject.msg);
    	        					dataview.getStore().reload();	
    	        				},
    	        				failure: function(response) {
    	        					Ext.Msg.show({
    	        						title: 'Error',
    	        						msg: 'Error al procesar la petición.',
    	        						buttons: Ext.Msg.OK,
    	        						icon: Ext.Msg.ERROR
    	        					});
    	        				}
    	        			});
    	        		}
    	        	}, this);

    	        }
    	    },/*{
    	        text: 'Principal',
    	        iconCls:'fa fa-check',
    	        // handler:'onWizard'
    	    },*/{
    	        text: 'Ver',
    	        iconCls:'fa fa-eye',
    	        handler:function(self){
			    	var vm = this.getViewModel();
			    	Ext.create('Ext.window.Window', {
			    	    title: 'Vista previa',
			    	    height: 400,
			    	    width: 800,
			    	    // layout: 'fit',
			    	    modal: true,
			    	    constrainHeader: true,
			    	    resizable: false,
			    	    maximizable: true,
			    	    bodyCls:'iframe-win',
			    	    bodyStyle: "padding-right:5px;padding-left:5px;",
	    	            layout: 'anchor', 
			    	    items : [{
		    	            xtype : "box",
		    	            autoEl : {
		    	                tag : "iframe",
		    	                src : vm.get("camera").image,
		    	                width: 400,
                                height: 380,
                                style: 'height: 100%; width: 100%; border: none',

		    	            }
		    	        }],
		    	        listeners:{
		    	        	afterrender:function(self){
		    	        		console.log(self);
		    	        	}
		    	        }
			    	    /*html: [
			    	    	'<div class="embed-container" style="background:red;scale:1;">',
			    	    		'<iframe src="'+ vm.get("camera").image +'" frameborder="0" scrolling="no" width="560" height="20" style="height:300px;width:300px;" frameborder="0"></iframe>',
		    	    		'</div>'
			    	    ].join("")*/
			    	}).show();
			    }
    	    }]
    	}).showBy(Ext.get(el),'c-bl',[-10,10]);
    },
    onPlayVideo:function(dataview, record, item, index, e, eOpts){
       var me = this;
       var videopreview = Ext.fly("videopreview");
       var closevideo = videopreview.down("#closevideo");
       var video = videopreview.down("video");
       var panel = dataview.up();
       var el = video.el.dom;
       var source;
       videopreview.removeCls("videopreview-hidden");

       el.addEventListener('ended',myHandler,false);
       var origH = dataview.height;
       function myHandler(e) {
        console.log("Video finalizó.")
        // panel.expand();
        // video.addCls("videopreview-hidden");
           // What you want to do after the event
       }


       source = video.down('source');
       source.dom.src = record.get("url");
       el.load();
       el.play(); 
       // panel.collapse(Ext.Component.DIRECTION_TOP,true);

       panel.on("collapse",function(self, eOpts ){
           el.play();  
       }); 
       closevideo.on("click",function(self, eOpts ){
           videopreview.addCls("videopreview-hidden");
           el.pause();  
           source.dom.src = "";
           if(panel.getCollapsed()!=false){
            // panel.expand();
           }
       }); 

       /*Ext.create('Ext.fx.Anim', {
           target: dataview,
           duration: 100,
           from: {
               y:  origH//starting width 400
           },
           to: {
               y:  0// end height 300
           },
           listeners:{
                afteranimate:function(anim, startTime, eOpts ){
                    el.play();
                } 
           }
       });*/

       // video.play();
       /*sources = sources[0];
       sources.src = record.get("url");*/
    },
    onLoadVideo:function(store,records,success,eOpts){
        var me =this.getView();
        var dataview = me.down("[name=video_viewer]");
        Ext.Array.each(Ext.query("video"), function(item, index, total) {
            var video = Ext.get(item);
            var el = video.el.dom;  
            el.addEventListener("error",function(event){
                console.log("Error al cargar video.");
            });
        });
    }
});
