Ext.define('Falcon.view.wizard.WizardForm', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.formswizard',

    cls: 'wizardone shadow',

    plugins: 'responsive',

    responsiveConfig: {
        'width >= 1000': {
            layout: {
                type: 'box',
                align: 'stretch',
                vertical: false
            }
        },

        'width < 1000': {
            layout: {
                type: 'box',
                align: 'stretch',
                vertical: true
            }
        }
    },

    items: [
        {
            xtype: 'wizform',
            cls: 'wizardone',
            colorScheme: 'blue',
            flex: 1
        }
    ]
});
