Ext.define('Admin.model.user.User', {
    extend: 'Admin.model.Base',
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