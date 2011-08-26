Ext.define('PVE.storage.NFSScan', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.pveNFSScan',

    queryParam: 'server',

    doRawQuery: function() {
    },

    onTriggerClick: function() {
	var me = this;

	if (!me.queryCaching || me.lastQuery !== me.nfsServer) {
	    me.store.removeAll();
	}

	me.allQuery = me.nfsServer;

	me.callParent();
    },

    setServer: function(server) {
	var me = this;

	me.nfsServer = server;
    },

    initComponent : function() {
	var me = this;

	if (!me.nodename) {
	    me.nodename = 'localhost';
	}

	var store = Ext.create('Ext.data.Store', {
	    fields: [ 'path', 'options' ],
	    proxy: {
		type: 'pve',
		url: '/api2/json/nodes/' + me.nodename + '/scan/nfs'
	    }
	});

	Ext.apply(me, {
	    store: store,
	    valueField: 'path',
	    displayField: 'path',
	    matchFieldWidth: false,
	    listConfig: {
		loadingText: 'Scanning...',
		width: 350
	    }
	});

	me.callParent();
    }
});

Ext.define('PVE.storage.NFSInputPanel', {
    extend: 'PVE.panel.InputPanel',

    onGetValues: function(values) {
	var me = this;

	if (me.create) {
	    values.type = 'nfs';
	} else {
	    delete values.storage;
	}

	values.disable = values.enable ? 0 : 1;	    
	delete values.enable;
	
	return values;
    },

    initComponent : function() {
	var me = this;


	me.column1 = [
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		name: 'storage',
		height: 22, // hack: set same height as text fields
		value: me.storageId || '',
		fieldLabel: 'Storage ID',
		vtype: 'StorageId',
		allowBlank: false
	    },
	    {
		xtype: me.create ? 'textfield' : 'displayfield',
		height: 22, // hack: set same height as text fields
		name: 'server',
		value: '',
		fieldLabel: 'Server',
		allowBlank: false,
		listeners: {
		    change: function(f, value) {
			if (me.create) {
			    var exportField = me.down('field[name=export]');
			    exportField.setServer(value);
			    exportField.setValue('');
			}
		    }
		}
	    },
	    {
		xtype: me.create ? 'pveNFSScan' : 'displayfield',
		height: 22, // hack: set same height as text fields
		name: 'export',
		value: '',
		fieldLabel: 'Export',
		allowBlank: false
	    },
	    {
		xtype: 'pveContentTypeSelector',
		name: 'content',
		value: 'images',
		multiSelect: me.storageId === 'local',
		fieldLabel: 'Content',
		allowBlank: false
	    }
	];

	me.column2 = [
	    {
		xtype: 'PVE.form.NodeSelector',
		name: 'nodes',
		fieldLabel: 'Nodes',
		emptyText: 'All (no restrictions)',
		multiSelect: true,
		autoSelect: false
	    },
	    {
		xtype: 'pvecheckbox',
		name: 'enable',
		checked: true,
		uncheckedValue: 0,
		fieldLabel: 'Enable'
	    }
	];

	me.callParent();
    }
});

Ext.define('PVE.storage.NFSEdit', {
    extend: 'PVE.window.Edit',

    initComponent : function() {
	var me = this;
 
	me.create = !me.storageId;

	if (me.create) {
            me.url = '/api2/extjs/storage';
            me.method = 'POST';
        } else {
            me.url = '/api2/extjs/storage/' + me.storageId;
            me.method = 'PUT';
        }

	var ipanel = Ext.create('PVE.storage.NFSInputPanel', {
	    create: me.create,
	    storageId: me.storageId
	});
	
	Ext.apply(me, {
	    title: me.create ? "Create NFS storage" :
		"Edit NFS storage '" + me.storageId + "'",
	    items: [ ipanel ]
	});

	me.callParent();

	if (!me.create) {
	    me.load({
		success:  function(response, options) {
		    var values = response.result.data;
		    var ctypes = values.content || '';

		    if (values.storage === 'local') {
			values.content = ctypes.split(',');
		    }
		    if (values.nodes) {
			values.nodes = values.nodes.split(',');
		    }
		    values.enable = values.disable ? 0 : 1;
		    ipanel.setValues(values);
		}
	    });
	}
    }
});