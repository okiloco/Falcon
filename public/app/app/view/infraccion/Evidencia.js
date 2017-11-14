Ext.define('Admin.view.infraccion.Evidencia', {
	extend: 'Ext.view.View',
	alias: ['widget.evidencia'],
	cls:"image-viewwer",
	tpl:new Ext.XTemplate(
		'<div>',
			'<tpl><div class="image-preview">',
			'<img id="img-preview" frameborder="0" height="100" width="100%" marginheight="0" marginwidth="0" scrolling="no" style="position:relative; border:0; height:100%; width:100%;" src="{[this.getPreview(values)]}" height="80px" width="160px"></img>',
			'</tpl></div>',
		'</div>',
		'<div class="image-items">',
			'<tpl for=".">',
				'<div class="item">',
					'<img id="img-image" controls="false" frameborder="0" height="90" width="100%" marginheight="0" marginwidth="0" scrolling="no" style="position:relative; border:0; height:90px; width:160px;" src="{url}" height="80px" width="160px"></img>',
					'<div class="hit-area"></div>',
				'</div>',
			'</tpl>',
		'</div>',
		{
			getPreview:function(val){
				return val[0].url;
			}
		}
	),
	itemSelector: 'div.hit-area',
	layout:'vbox',
	store:Ext.create('Ext.data.Store', {
		fields: ['url', 'filename'],
		data : [
		    {"url":"AL", "filename":"Alabama"}        
		]
	}),
	listeners:{
		afterrender:function(self){
			var me = this;
			if(self.record!=undefined){
				var record = self.record;
				self.getStore().loadData(record.get("images").map(function(val){
					return {
						"url":BASE_PATH+val.url,
						"filename":val.filename
					}
				}));
				// $('iframe').resizeiframe();
			}
		},
		itemClick:function(dataview, record, item, index, e, eOpts){
			var preview = Ext.fly("img-preview");
			preview.set({"src":record.get("url")});
		}
	}
});