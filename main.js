const {app, BrowserWindow, dialog} = require('electron')
const ElectronOnline = require('electron-online')
const path = require('path')
const url = require('url')
var server = require('./server/app');
var Constants = require("./server/helpers/Constants.js");
var Helper = require("./server/helpers/helper");
process.env['APP_PATH'] = app.getAppPath();
global.APP_PATH = app.getAppPath();

var app_config = path.join(global.APP_PATH,'server','app.json');

let win;
let splashscreen;
let ready = false;
let win_tmp;

function loadConfig(callback){
	Helper.readFile(app_config)
	.then(function(obj){
		// Helper.writeFile(app_config,obj);
		if(callback!=undefined){
			callback(obj);
		}
	},function(err){
		// Helper.writeFile(app_config,obj);
		if(callback!=undefined){
			callback({});
		}
	});
}
function createWindow(options,callback){
	options = options || {};

	win = new BrowserWindow({backgroundColor: '#2e2c29',center:true, show: false, width:options.width || 1366,height: options.height || 768,background:"#18425A", title:'Falcon System', icon:__dirname+'/assests/icon.png'})

	// mainWindow = new BrowserWindow({width: WINDOW_WIDTH, height: WINDOW_HEIGHT, x: x, y: y});
	return new Promise(function(resolve,reject){
		win.loadURL(Constants.URL_BASE+(options.url || ''));
		//Abrir inspector de elementos
		win.webContents.openDevTools();

		win.on("closed",()=>{
			win = null;
			app.quit();
		})
		const ses = win.webContents.session;
		
		win.once('ready-to-show', () => {
	     	win.show();
			if(!ready){
				win_tmp = win;		
			}else{
				if(win_tmp!=undefined){
					win_tmp.close();
				}
			}
	     	if(splashscreen!=undefined){
	     		try{
	     			splashscreen.close();
	     		}catch(err){
	  				console.log("Error ",err)
	  			}
	     	}
	    });
		if(callback!=undefined){
			callback(win);
		}
	    resolve(win);
	});
}
function SplashScreen(options){
	splashscreen = new BrowserWindow({show: false, frame:false,backgroundColor: '#fff',center:true,width:400,height: 250,background:"#18425A", titleBarStyle: 'hidden', icon:__dirname+'/assests/icon.png'});
	splashscreen.on("closed",()=>{
		win = null;
	});
	splashscreen.loadURL(Constants.URL_BASE+"public/app/splashscreen.html");
	splashscreen.once('ready-to-show', () => {
	     splashscreen.show();
    });
}

function init(callback){
	if(!Helper.isEmpty(config)){
		console.log("Aplicación Iniciada.",process.env['APP_PATH'])
		if(splashscreen!=undefined){
			splashscreen.hide();
		}
		createWindow({url:'public/app/index.html#login'})
		.then(win=>{
			ready=true;
		});
	}else{
		
		const connection = new ElectronOnline();
	    if(splashscreen!=undefined){
			splashscreen.hide();
		}
	    
		connection.on('online', () => {
		  console.log('App is online!')
		  console.log("La Aplicación está lista para ser Instalada.");
		  if(!ready){
			  createWindow({url:'public/app/index.html#wizard'})
			  .then(win=>{
			  	ready=true;
			  });
		  }
		})
		 
		connection.on('offline', () => {
		  	console.log('App is offline!');
		  	if(!ready){
			  	createWindow({url:'public/app/index.html#offline'})
				  .then(win=>{
			  	});
			}
		});
	}
}
app.on("ready",function(_win){	
	SplashScreen({"url":"public/app/splashscreen.html"});

	Helper.readFile(app_config)
	.then(function(config){

		server(config)
		.then(function(msg){
			console.log(msg);
			init();
		},
		function(err){
			createWindow({url:'public/app/index.html#error'})
			.then(win=>{
				console.log("Error al conectarse a  la base de Datos: ",err);
			});	
		});
	},function(err){
		// Helper.writeFile(app_config,obj);
		if(callback!=undefined){
			callback({});
		}
		createWindow({url:'public/app/index.html#error'})
		.then(win=>{
		});
	});
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

/*
* @Msg
* config: {title,message}
*/
function Msg(config){
	dialog.showMessageBox(win,config);
}
exports.APP_PATH = process.env['APP_PATH'];
exports.Msg = Msg;

const isReady = ()=> ready;
exports.isReady = isReady;
