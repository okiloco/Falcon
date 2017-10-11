const remote = require("electron").remote;
const main = remote.require('./main.js');

global.main =main;

main.loadConfig(function(config){
	main.server(config)
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