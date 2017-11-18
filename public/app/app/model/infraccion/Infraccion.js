Ext.define('Admin.model.infraccion.Infraccion', {
    extend:'Admin.model.Base',
    fields:[
        {   
          name : 'id',
          persist: false
        }, 
       "codigo",
       "lote",
       "placa",
       "direccion",
       "municipio",
       "dispositivo",
       "lat",
       "long",
       "user",
       "fecha",
       "images",
       "videos",
       "estado",
       "urls",
        {
          name:"estado_desc",
          convert:function(v,record){
            return (record.get("estado")==0)?"Pendiente":"Enviada";
          }
        },
        {
          name:"username", mapping:"creator.username"
        },
        {
          name:"changed", defaultValue:false, type:'bool'
        }
    ],
    proxy: {
       type: 'rest',
       url : Constants.URL_INFRACCIONES
    }
});