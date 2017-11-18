Ext.define('Admin.view.infraccion.Evidencia', {
	extend: 'Ext.view.View',
	alias: ['widget.evidencia'],
	cls:"image-viewwer",
	tpl:new Ext.XTemplate(
		'<div>',
			'<tpl><div class="image-preview">',
			'<img id="img-preview" frameborder="0" height="100" width="100%" marginheight="0" marginwidth="0" scrolling="no" style="position:relative; border:0; height:100%; width:100%;" src="http://localhost:3000/app/image/preview?id={[this.getPreview(values)]}" height="80px" width="160px"></img>',
			'</tpl></div>',
		'</div>',
		'<div class="image-items">',
			'<tpl for=".">',
				'<div class="item">',
					'<img id="img-image" controls="false" frameborder="0" height="90" width="100%" marginheight="0" marginwidth="0" scrolling="no" style="position:relative; border:0; height:90px; width:160px;" src="http://localhost:3000/app/image/preview?id={id}" height="80px" width="160px"></img>',
					'<div class="hit-area"></div>',
				'</div>',
			'</tpl>',
		'</div>',
		{
			getPreview:function(val){
				return val[0].id;
			}
		}
	),
	itemSelector: 'div.hit-area',
	layout:'vbox',
	store:Ext.create('Ext.data.Store', {
		fields: ['url', 'filename','id'],
		data : [
		]
	}),
	listeners:{
		afterrender:function(self){
			var me = this;
			if(self.record!=undefined){
				var record = self.record;
				var images = record.get("images").map(function(val){
					return {
						"id":("image" in val)?val.image.id:val.id,
						"url":BASE_PATH+("image" in val)?val.image.url:val.url,
						"filename":("image" in val)?val.image.filename:val.filename
					}
				});
				self.getStore().loadData(images);
				// $('iframe').resizeiframe();
			}
		},
		itemClick:function(dataview, record, item, index, e, eOpts){
			var preview = Ext.fly("img-preview");
			preview.set({"src":"http://localhost:3000/app/image/preview?id="+record.get("id")});
		}
	}
});