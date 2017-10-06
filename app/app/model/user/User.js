Ext.define('Admin.model.user.User', {
    extend: 'Admin.model.Base',
    fields:[
        'username',
        'email',
        'cedula',
        'telefono',
        'celular',
        'direccion',
        'nombres',
        'apellidos',
        'rol_id',
        {name:'id',mapping:"_id"},
        { name: 'rol', mapping:'usergroup.name'},
        { name: 'usergroup', mapping:'usergroup._id'},
        'estado'
    ]
});