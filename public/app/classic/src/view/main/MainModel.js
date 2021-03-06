Ext.define('Admin.view.main.MainModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.main',

    data: {
    	socket:{},
        instaled:false,
    	defaultToken:'ptz',
        currentView: null,
        total:null,
        picture:'resources/images/user-profile/2.png',
        user:localStorage.user,
        username:localStorage.getItem("username"),
        organismo:'',
        config:{}
    }
});
