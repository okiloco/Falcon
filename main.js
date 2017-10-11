const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
var server = require('./server/app');


var Helper = require("./server/helpers/helper");
var app_config = './server/app.json';
function loadConfig(callback){
	Helper.readFile(app_config)
	.then(function(obj){
		// Helper.writeFile(app_config,obj);
		if(callback!=undefined){
			callback(obj);
		}
	});
}


let win
function createWindow(options){
	options = options || {};
	win = new BrowserWindow({width:options.width || 1366,height: options.height || 768,background:"#18425A", title:'SnapShot Stream', icon:__dirname+'/assests/icon.png'})



	return new Promise(function(resolve,reject){
		win.loadURL(url.format({
			pathname:path.join(__dirname,(options.url || '/public/app/index.html')),
			protocol:'file:',
			slashes:true
		}));

		//Abrir inspector de elementos
		win.webContents.openDevTools();

		win.on("closed",()=>{
			win = null;
		})
		const ses = win.webContents.session;
		

	    var hasGP = false;
	    var repGP;
	    resolve(win);
	});
}

loadConfig(function(config){
	server(config)
	.then(function(){
		console.log("Aplicación Iniciada.",__dirname)

		createWindow({url:'/public/app/index.html'})
		.then(win=>{
		});
	},
	function(err){
		console.log("No se pudo Iniciar la Aplicación.");
		/*createWindow({
			width:400,
			height:400,
		});*/
	});
});
exports.canGame = function(){
    return "getGamepads" in win;
}
app.on("ready",function(win){
	// createWindow()
});

app.on("window-all-closed",()=>{

	if(process.platform !== 'drawin'){
		app.quit()
	}
})

app.on("active",()=>{
	if(win===null){
		createWindow()
	}
})