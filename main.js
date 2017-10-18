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
	},function(err){
		// Helper.writeFile(app_config,obj);
		if(callback!=undefined){
			callback({});
		}
	});
}


let win
let splashscreen;

function createWindow(options){
	options = options || {};
	win = new BrowserWindow({backgroundColor: '#2e2c29',center:true, show: false, width:options.width || 1366,height: options.height || 768,background:"#18425A", title:'Falcon System', icon:__dirname+'/assests/icon.png'})


	// mainWindow = new BrowserWindow({width: WINDOW_WIDTH, height: WINDOW_HEIGHT, x: x, y: y});
	return new Promise(function(resolve,reject){
		/*win.loadURL(url.format({
			pathname:path.join(__dirname,(options.url || '/public/app/index.html')),
			protocol:'file:',
			slashes:true
		}));*/
		win.loadURL("http://localhost:3000/"+(options.url || ''));
		//Abrir inspector de elementos
		win.webContents.openDevTools();

		win.on("closed",()=>{
			win = null;
		})
		const ses = win.webContents.session;
		
		win.once('ready-to-show', () => {
		     win.show();
		     splashscreen.close();
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
	splashscreen.loadURL("http://localhost:3000/public/app/splashscreen.html");
	splashscreen.once('ready-to-show', () => {
	     splashscreen.show();
    });
}

exports.server = server;

exports.canGame = function(){
    return "getGamepads" in win;
}
app.on("ready",function(win){	
	SplashScreen({"url":"public/app/splashscreen.html"});
	loadConfig(function(config){
		
		server(config)
		.then(function(){
			console.log("Aplicación Iniciada.",__dirname)
			splashscreen.hide();
			createWindow({url:'public/app/index.html#login'})
			.then(win=>{
			});
		},
		function(err){
			splashscreen.hide();
			console.log("La Aplicación está lista para ser Instalada.");
			createWindow({url:'public/app/index.html#wizard'})
			.then(win=>{
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