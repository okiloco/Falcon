Ext.define('Falcon.view.wizard.Wizards', {
    extend: 'Ext.container.Container',
    xtype: 'wiz',

    cls: 'wizards',
    defaultFocus : 'wizardform',
    layout: 'responsivecolumn',

    items: [
        {
            xtype: 'formswizard',
            userCls: 'big-100'
        }
    ]
});
