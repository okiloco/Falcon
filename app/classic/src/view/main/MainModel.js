Ext.define('Admin.view.main.MainModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.main',

    data: {
        currentView: null,
        picture:'resources/images/user-profile/2.png',
        user:localStorage.user,
        username:localStorage.getItem("username") 
    }
});
