Ext.define('PVE.form.StorageSelector', {
    extend: 'PVE.form.ComboGrid',
    requires: [
	'Ext.data.Store', 
	'PVE.RestProxy'
    ],
    alias: ['widget.PVE.form.StorageSelector'],

    setNodename: function(nodename) {
	var me = this;

	if (!nodename || (me.nodename === nodename)) {
	    return;
	}

	me.nodename = nodename;

	var url = '/api2/json/nodes/' + me.nodename + '/storage';
	if (me.storageContent) {
	    url += '?content=' + me.storageContent;
	}

	me.store.setProxy({
	    type: 'pve',
	    url: url
	});

	me.store.load();
    },

    initComponent: function() {
	var me = this;

	var nodename = me.nodename;
	me.nodename = undefined; 

	var store = Ext.create('Ext.data.Store', {
	    fields: [ 'storage', 'active', 'type', 'avail', 'total' ]
	});

	Ext.apply(me, {
	    store: store,
	    allowBlank: false,
	    valueField: 'storage',
	    displayField: 'storage',
            listConfig: {
		columns: [
		    {
			header: 'Name',
			dataIndex: 'storage',
			hideable: false,
			flex: 1
		    },
		    {
			header: 'Type',  
			width: 60, 
			dataIndex: 'type'
		    },
		    {
			header: 'Avail',  
			width: 80, 
			dataIndex: 'avail', 
			renderer: PVE.Utils.format_size 
		    },
		    {
			header: 'Capacity',  
			width: 80, 
			dataIndex: 'total', 
			renderer: PVE.Utils.format_size 
		    }
		]
	    }
	});

        me.callParent();

	if (nodename) {
	    me.setNodename(nodename);
	}
    }
});