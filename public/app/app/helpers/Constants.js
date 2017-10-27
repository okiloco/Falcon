Ext.define('Admin.helpers.Constants', {
	alternateClassName: 'Constants',
	singleton: true,
	//App
	URL_CONFIG_APP:BASE_PATH+'config/',
	URL_WIZARD:BASE_PATH+'install',
	
	//Login
	URL_LOGIN:BASE_PATH+'login',
	URL_LOGOUT_APP:BASE_PATH+'logout',
	URL_VIEWER:"http://"+global.IP_CAMERA+'/mjpg/video.mjpg',

	//Iconos
	URL_ICON_IMAGEN_EMPTY:'public/app/resources/images/icons/64/camera.png',

	//Schema
	URL_SCHEMA:BASE_PATH+'app/schemas',
	//PTZ
	URL_GRABAR_VIDEO:BASE_PATH+'app/video',
	URL_DETENER_VIDEO:BASE_PATH+'app/video/stop',
	URL_CAPTURAR_IMAGEN:BASE_PATH+'app/image/new',


	//Usuarios
	URL_USUARIOS:BASE_PATH+'app/users',

	//Grupos
	URL_GROUPS:BASE_PATH+'app/groups',

	//Infracciones
	URL_INFRACCIONES:BASE_PATH+'app/infracciones/new',

	//Imagenes
	URL_IMAGES:BASE_PATH+'app/images',

	//Videos
	URL_VIDEOS:BASE_PATH+'app/videos',


	//Organismos
	URL_ORGANISMOS:BASE_PATH+'organismos',

	URL_DISPOSITIVOS:BASE_PATH+'dispositivos',


	//Backoffice
	// URL_BACKOFFICE:'http://backof-dev.construsenales.co/service/falconwebservice/falconFileUpload',
	URL_BACKOFFICE:'http://backoffice.construsenales.co/service/falconwebservice/falconFileUpload',

	MAX_CAPTURES:4,
	MAX_REC:4,
});