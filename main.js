const path = require('path')
const url = require('url')
var fs = require('fs');

const {app, BrowserWindow, dialog} = require('electron')

global.APP_PATH = app.getAppPath();
global.USER_DATA = isDev()?__dirname:path.join(app.getPath("appData"),app.getName());
process.env['USER_DATA'] = global.USER_DATA;

const ElectronOnline = require('electron-online')
var server = require('./server/app');

var Constants = require("./server/helpers/Constants.js");
var Helper = require("./server/helpers/helper");

let win;
let splashscreen;
let ready = false;
let win_tmp;

function isDev() {
  return process.mainModule.filename.indexOf('app.asar') === -1;
}
//dialog.showErrorBox("Atención",global.USER_DATA);
console.log("USER_DATA: ",global.USER_DATA);

function loadConfig(callback){

	if (!fs.existsSync(Constants.URL_APP_RESOURCES)) {
		fs.mkdirSync(Constants.URL_APP_RESOURCES);
	}

	if (!fs.existsSync(Constants.URL_APP_SETTINGS)) {
		dialog.showErrorBox("Atención",Constants.URL_APP_SETTINGS);
		try{
      		fs.mkdirSync(Constants.URL_APP_SETTINGS);
      		
      		Helper.writeFile(Constants.URL_APP_CONFIG,{});
      		console.log("path creado:",Constants.URL_APP_SETTINGS);
		}catch(err){
			dialog.showErrorBox("Error",Constants.URL_APP_SETTINGS);
			if(callback!=undefined){
				callback(err);
			}
			return;
		}
  	}else{
  		if (!fs.existsSync(Constants.URL_APP_CONFIG)) {
  			try{
      			Helper.writeFile(Constants.URL_APP_CONFIG,{});
      			console.log("Archivo configuración creado:",Constants.URL_APP_SETTINGS);
      		}catch(err){
      			dialog.showErrorBox("Error",err+":"+Constants.URL_APP_CONFIG);
      			if(callback!=undefined){
					callback(err);
				}
      			return;
      		}
      	}
  	}
	Helper.readFile(Constants.URL_APP_CONFIG)
	.then(function(obj){
		if(callback!=undefined){
			callback(null,obj);
		}
	},function(err){
		if(callback!=undefined){
			callback(err);
		}
	});
}
function createWindow(options,callback){
	options = options || {};

	win = new BrowserWindow({backgroundColor: '#2e2c29',center:true, show: false, width:options.width || 1366,height: options.height || 768,background:"#18425A", title:'Falcon System', icon:path.join(__dirname,'assests','icon.png')})

	// mainWindow = new BrowserWindow({width: WINDOW_WIDTH, height: WINDOW_HEIGHT, x: x, y: y});
	return new Promise(function(resolve,reject){
		win.loadURL(Constants.URL_BASE+(options.url || ''));
		//Abrir inspector de elementos
		//win.webContents.openDevTools();

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
		console.log("Aplicación Iniciada.",config)
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
		  
		  if(!ready){
		  	console.log('App is online!')
		  	console.log("La Aplicación está lista para ser Instalada.")	
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
	loadConfig((err,config) => {

		if(err){
			dialog.showErrorBox("Error",err);
			return;
		}

		server(config)
		.then(function(msg){
			init();
		},
		function(err){
			createWindow({url:'public/app/index.html#error'})
			.then(win=>{
				console.log("Error al conectarse a  la base de Datos: ",err);
			});	
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


global.Msg = (title,message) => {
	try{
		dialog.showErrorBox(title,message);
	}catch(err){
		console.log(err);		
	}
}
exports.USER_DATA = process.env['USER_DATA'];
exports.APP_PATH  = global.APP_PATH;
exports.Msg = global.Msg;

const isReady = ()=> ready;
exports.isReady = isReady;
exports.loadConfig = loadConfig;

