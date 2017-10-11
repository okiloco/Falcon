Ext.define('Admin.model.infraccion.Infraccion', {
    extend:'Admin.model.Base',
    fields:[
    {name:"id", convert:function(v){
    	return undefined;
    }},
       "_id",
       "codigo",
       "lote",
       "placa",
       "direccion",
       "municipio",
       "dispositivo",
       "lat",
       "long",
       "user",
       "estado",
       "fecha",
       "images",
       "videos"
    ],
    proxy: {
       type: 'rest',
       url : Constants.URL_INFRACCIONES
    },
    insertVideo:function(video_id){
    	var videos = this.get("videos") || [];
    	videos.push(video_id);
    	this.set("videos",videos);
    },
    insertImage:function(image_id){
    	var images = this.get("images") || [];
    	images.push(image_id);
    	this.set("images",images);
    }
});