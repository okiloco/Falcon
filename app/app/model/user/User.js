Ext.define('Falcon.model.user.User', {
    extend: 'Falcon.model.Base',
    fields:[
        'id',
        'username',
        'email',
        'cedula',
        'telefono',
        'celular',
        'direccion',
        'nombres',
        'apellidos',
        'rol_id',
        'rol',
        'estado'
    ]
});