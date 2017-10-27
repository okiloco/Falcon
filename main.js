const {app, BrowserWindow} = require('electron')

const path = require('path')
const url = require('url')
var server = require('./server/app');
var Constants = require("./server/helpers/Constants.js");
var Helper = require("./server/helpers/helper");
var app_config = './server/app.json';
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


let win;
let splashscreen;
let ready = false;
let win_tmp;
function createWindow(options){
	options = options || {};


	win = new BrowserWindow({backgroundColor: '#2e2c29',center:true, show: false, width:options.width || 1366,height: options.height || 768,background:"#18425A", title:'Falcon System', icon:__dirname+'/assests/icon.png'})

	// mainWindow = new BrowserWindow({width: WINDOW_WIDTH, height: WINDOW_HEIGHT, x: x, y: y});
	return new Promise(function(resolve,reject){
		win.loadURL(Constants.URL_BASE+(options.url || ''));
		//Abrir inspector de elementos
		win.webContents.openDevTools();

		win.on("closed",()=>{
			win = null;
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

	    var hasGP = false;
	    var repGP;
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

exports.server = server;

exports.canGame = function(){
    return "getGamepads" in win;
}
app.on("ready",function(_win){	
	SplashScreen({"url":"public/app/splashscreen.html"});
	loadConfig(function(config){
		server(config)
		.then(function(){
			console.log("Aplicación Iniciada.",__dirname)
			splashscreen.hide();
			createWindow({url:'public/app/index.html#login'})
			.then(win=>{
				ready=true;
			});
		},
		function(err){
			const ElectronOnline = require('electron-online')
			const connection = new ElectronOnline();
		    splashscreen.hide();
		    

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