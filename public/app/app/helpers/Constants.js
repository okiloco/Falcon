Ext.define('Admin.helpers.Constants', {
	alternateClassName: 'Constants',
	singleton: true,
	//App
	URL_CONFIG_APP:BASE_PATH+'config/',
	//Login
	URL_LOGIN:BASE_PATH+'login',
	URL_LOGOUT_APP:BASE_PATH+'logout',
	URL_VIEWER:IP_CAMERA+'/mjpg/video.mjpg',

	//Iconos
	URL_ICON_IMAGEN_EMPTY:'resources/images/icons/64/camera.png',

	//Schema
	URL_SCHEMA:BASE_PATH+'app/schemas',
	//PTZ
	URL_GRABAR_VIDEO:BASE_PATH+'app/video',
	URL_DETENER_VIDEO:BASE_PATH+'app/video/stop',
	URL_CAPTURAR_IMAGEN:BASE_PATH+'app/image/new',

	URL_USUARIOS:BASE_PATH+'app/users',

	//Infracciones
	URL_INFRACCIONES:BASE_PATH+'app/infracciones',
});