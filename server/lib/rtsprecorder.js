var Recorder = require('rtsp-recorder');
var fs = require('fs');
var dateFormat = require('dateformat');
var MjpegConsumer = require('mjpeg-consumer');
var path = require('path'); 
var ffmpeg = require('fluent-ffmpeg');
const {spawn} = require ('child_process');

/**
* @params:
* cameraIP,
* url,
* timeLimit//length of one video file (seconds) 
* folder: 'videos/', //path to video folder 
* prefix: 'vid-', //prefix for video files 
* movieWidth: 1280, //width of video 
* movieHeight: 720, //height of video 
* maxDirSize: 1024*20, //max size of folder with videos (MB), when size of folder more than limit folder will be cleared 
* maxTryReconnect: 5 //max count for reconnects    
*/



/**
 * Date to string
 * @param date {Date|undefined}
 * @returns {string}
 */
function dateString(date){
	var dt = date || (new Date());
	return [dt.getDate(), dt.getMonth(), dt.getFullYear()].join('-')+' '
		+[dt.getHours(), dt.getMinutes(), dt.getSeconds()].join('-');
}

function generateGET(options) {
  // Create string for GET requests in a url
  var arguments = '?';

  var i = 1;
  for (var key in options) {
	arguments += key + '=' + options[key];

	// Append & separator to all but last value
	if (i != Object.keys(options).length)
	  arguments += '&';

	i++;
  }

  return arguments;
};



Recorder.prototype.setConfig = function(options){
	console.log("timeLimit: ",this.timeLimit);
	//para emitir eventos ilimitados
	this.setMaxListeners(0);
	if(options.duration==undefined){
		options["duration"] = 600;
	}
	for(var key in options){
		
		if(key=="duration"){
			this["timeLimit"] = options[key];
		}else{
			this[key] = options[key];
		}
	}
}

Recorder.prototype.pause = function(callback){
	var self = this;
	self.playing = (!self.playing);
	self._readStarted = (!self._readStarted);
	self.emit("pause",self.playing,callback);
	if(callback!=undefined){
		callback(self); 
	}
	return self;
}

Recorder.prototype.stop = function(callback){
	var self = this;
	self.emit("end");
	if(self.writeStream!=null){
		self.writeStream.end();
		self.readStream.stdout.unpipe(this.writeStream);
	}
	if(callback!=undefined){
		callback(self); 
	}
	return self;
}
var count;
Recorder.prototype.record = function(options,callback){
	
	var self = this;
	this._action = options.action;

	var basepath = this.folder;
	if (!fs.existsSync(basepath)) {
		try{
      		fs.mkdirSync(basepath);
		}catch(err){
			console.log("Error al Crear Directorio base de Videos: ",err);
		}
  	}
	
	var lote = dateFormat(new Date(),"yyyymmdd");
	basepath = path.join(basepath,lote);
	if (!fs.existsSync(basepath)) {
		try{
  			fs.mkdirSync(basepath);
		}catch(err){
			console.log("Error al Crear Directorio Videos: ",err);
		}
	}	
	
	this.lote = dateFormat(new Date(),"yyyymmdd");

	//

	//CZBQ2_20171012_90 - IDDISPOSITIVO_LOTE_CONSECUTIVO
	this.filename = this.prefix+'_'+this.lote+'_'+options.count+'.mp4';
	this.filename_tmp = this.prefix+'_'+this.lote+'_'+options.count+'_temp.mp4';
	
	this.path_video_tmp = path.join(basepath,this.filename_tmp);
	this.path_video = path.join(basepath,this.filename);
	
	this.url_video ='./public/videos/'+this.lote+"/"+this.filename;
	
	console.log(this.filename_tmp);

	if(typeof(options)!=undefined){
		if(typeof(options)=='function' && callback == undefined){
			callback = options;
		}else{
			this.setConfig(options);
		}
	}
	this.once('readStart', function(){
		if(self.playing){
			if (!fs.existsSync(self.path_video_tmp)) {
				
				    self.writeStream = fs.createWriteStream(self.path_video_tmp);
	    			self.readStream.stdout.pipe(self.writeStream);


	    			console.log("duration: ",this.timeLimit);
	    			setTimeout(function(){
	    			  console.log("time out.");
	    			  self.emit("end");
	    			},((self.timeLimit)*1000));

	    			this.once("end",function(){
	    				self._readStarted = false;
	    				self.playing = false;

	    				var stream = new ffmpeg(self.path_video_tmp)
	    				.size('800x450')
	    				.videoBitrate(800)
	    				.videoCodec('libx264')
	    				.fps(30)
	    				.save(this.path_video)
	    				.on('end', function() {
	    				    console.log('Convert finished !');
                  self.emit("video-convert");
	    						fs.unlink(self.path_video_tmp, function (err) {
                    if (err) {
                        throw err;
                    }
                  });
    				  });
	    				if(callback!=undefined){
	    					callback(self);
	    				} 
	    			});
	    			console.log("Start record "+self.path_video_tmp+"\r\n");
		  	}else{
    			console.log("El video ya existe y no se puede reescribir.",self.path_video_tmp+"\r\n");
		  		if(callback!=undefined){
		  			callback();
		  		} 
		  	}
		}
	});

	this.on('readStart', function(){
			
		this.on("pause",function(playing,callback){
			if(!self.playing){
				this.readStream.stdin.pause();
				this.readStream.stdout.pause();
				//this.readStream.stdout.unpipe(this.writeStream);
			}else{
				// this.readStream.stdout.resume();
			    this.readStream.stdout.pipe(this.writeStream);
			}
			console.log("playing",playing)
		});
		
	});

	this.on('readStart', function(){
		if(this.readStream!=null){
			self.on('camData', function(chunk) {
				//console.log(self.playing);
			});
		}
	});
	
	if(!self._readStarted){
		this.writeStream = null;
        //stream to read video from ffmpeg
        this.readStream = null;
		//width of movie clip
        this.movieWidth = 0;
        //height of movie clip
        this.movieHeight = 0;
        self.playing = true;
		this.connect();
		// this.recordVideo(options);
	}
	this.on('lostConnection',function(){
		if(callback!=undefined){
			callback();
		}
	});
	return this;
}

Recorder.prototype.recordVideo = function(options) {

		var self = this;
		var lote = dateFormat(new Date(),"yyyymmdd");
		var basepath = path.join(this.folder,lote);
		var output_path = path.join(basepath,"prueba.mp4");
		

		this.filename = this.prefix+'_'+this.lote+'_'+options.count+'.mp4';
		this.filename_tmp = this.prefix+'_'+this.lote+'_'+options.count+'_temp.mp4';
		this.path_video_tmp = path.join(basepath,this.filename_tmp);
		this.path_video = path.join(basepath,this.filename);

		/*var proc = new ffmpeg(
			this.url
		)
		.size('800x450')
		.videoBitrate(800)
		.videoCodec('libx264')
		.fps(30)
		.save(output_path);*/

		//ffmpeg -i rtsp://192.168.1.155/axis-media/media.amp?videocodec=h264&resolution=800x450 -y -b:v 800k -vcodec libx264 -r 30 -filter:v scale=w=800:h=450 public/videos/20171019/prueba.mp4

			/*this.readStream = spawn("ffmpeg",
			    ["-rtsp_transport", "tcp", "-i", this.url, '-y', '-b:v', '800k', '-vcodec', 'libx264', '-r', '30', '-'],
			    {detached: false}
			);*/


    		/*var stream = spawn("ffmpeg",
			    ["-rtsp_transport", "tcp", "-i", this.url+"&duration=8", '-y', '-b:v', '800k', '-vcodec', 'libx264', '-r', '30', '-filter:v', 'scale=w=800:h=450', self.filename],
			    {detached: false}
				);*/

				var stream = new ffmpeg(this.url)
				.size('800x450')
				.videoBitrate(800)
				.videoCodec('libx264')
				.fps(30)
				.save(self.filename);

				stream.on('start', function(commandLine) {
			    console.log('Spawned Ffmpeg with command: ' + commandLine);
		    	    var child = stream.ffmpegProc;
			    	    child.stderr.on('data', function(err) {
		  		   		console.log("Error: ",err);
		  	  	    });
    	    
			  });
		   	/*if(!self._readStarted){
          self._readStarted = true;
          self.emit('start');
        }		

		    stream.stdout.on('data', function(chunk) {
		   		console.log("chick: ",chunk);
	  	  });
		   
		    stream.stdout.on('close', function() {
			   	console.log("closed.");
			   	self._readStarted = false;
		    });
				
		    this.on("start",function(){

			   	self.writeStream = fs.createWriteStream(self.filename);
			   	stream.stdout.pipe(self.writeStream);

			   	console.log("Started!");
			   	setTimeout(function(){
			   	    self.writeStream.end();
			   	}, self.timeLimit*1000);

			   	self.writeStream.on('finish', function(){
			   	    console.log("Finished.");
			   	    stream.stdin.pause();
			   	});

		   });*/
  	  
			/*stream.stderr.on('data', function(data) {
				if(!self._readStarted){
		            self._readStarted = true;
		            self.emit('start');
		        }
			});


			this.once("start",function(){

			    self.writeStream = fs.createWriteStream(output_path);
			    self.readStream.stdout.pipe(self.writeStream);


			    self.writeStream.on('finish', function(){
			        // self.recordStream();
			    	console.log("Video terminado.")
			        process.kill(self.readStream.pid);
			    });

			    setTimeout(function(){
			        self.writeStream.end();
			    }, self.timeLimit*1000);

			    console.log("Start record "+output_path+"\r\n");
			});*/

}
exports.createRecorder = function(options,db) {
	var path = 'rtsp://'+options.cameraIP+'/axis-media/media.amp'+generateGET({
		videocodec:options.videocodec,
		resolution:options.resolution
	});

	this.folder = options.folder;
	this.prefix = options.prefix;
	this.id_dispositivo = options.id_dispositivo;
	this.db = db;
	var config = {
		url:path,
		id_dispositivo:this.id_dispositivo,
		videocodec:options.videocodec,
		db: this.db,
		// timeLimit: (options.duration!=undefined)?options.duration:this.timeLimit, //length of one video file (seconds) 
		folder: this.folder, //path to video folder 
		prefix: this.prefix, //prefix for video files 
		movieWidth: 1280, //width of video 
		movieHeight: 720, //height of video 
		maxDirSize: 1024*20, //max size of folder with videos (MB), when size of folder more than limit folder will be cleared 
		//maxTryReconnect: 5 //max count for reconnects    
	};

	if(options.duration!=undefined){
		config["timeLimit"]=options.duration;
	}
	var rec = new Recorder(config);
	
	return rec;
};