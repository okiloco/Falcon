const path = require('path');
module.exports = {

	URL_BASE:'http://localhost:3000/',
	//backoffice
	URL_SUBIR_ARCHIVOS_BACKOFFICE:'http://backoffice.construsenales.co/service/falconwebservice/falconFileUpload',

	URL_ORGANISMOS:'http://backoffice.construsenales.co/service/falconwebservice/listarOrganismos',
	URL_DISPOSITIVOS:'http://backoffice.construsenales.co/service/falconwebservice/listarCamaras',

	//User Data
	URL_APP_CONFIG:path.join(global.USER_DATA,'settings','app.json'),
	URL_APP_SETTINGS:path.join(global.USER_DATA,'settings'),
	URL_APP_RESOURCES:path.join(global.USER_DATA,'resources'),
}