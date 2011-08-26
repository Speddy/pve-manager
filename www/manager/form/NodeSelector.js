Ext.define('PVE.form.NodeSelector', {
    extend: 'PVE.form.ComboGrid',
    requires: [
	'Ext.data.Store', 
	'PVE.RestProxy'
    ],
    alias: ['widget.PVE.form.NodeSelector'],

    // invalidate nodes which are offline
    onlineValidator: false,

    initComponent: function() {
	var me = this;

	var store = Ext.create('Ext.data.Store', {
	    fields: [ 'name', 'cpu', 'maxcpu', 'mem', 'maxmem', 'uptime' ],
	    autoLoad: true,
	    proxy: {
		type: 'pve',
		url: '/api2/json/nodes'
	    },
	    autoDestory: true,
	    sorters: [
		{
		    property : 'mem',
		    direction: 'DESC'
		},
		{
		    property : 'name',
		    direction: 'ASC'
		}
	    ]
	});

	Ext.apply(me, {
	    store: store,
	    valueField: 'name',
	    displayField: 'name',
            listConfig: {
		columns: [
		    {
			header: 'Node',
			dataIndex: 'name',
			hideable: false,
			flex: 1
		    },
		    {
			header: 'Memory usage',			
			renderer: PVE.Utils.render_mem_usage,
			width: 100,
			dataIndex: 'mem'
		    },
		    {
			header: 'CPU usage',
			renderer: PVE.Utils.render_cpu,
			sortable: true,
			width: 100,
			dataIndex: 'cpu'
		    }
		]
	    },
	    validator: function(value) {
		/*jslint confusion: true */
		if (!me.onlineValidator || (me.allowBlank && !value)) {
		    return true;
		}
		
		var offline = [];
		Ext.Array.each(value.split(/\s*,\s*/), function(node) {
		    var rec = me.store.findRecord(me.valueField, node);
		    if (!(rec && rec.data) || !Ext.isNumeric(rec.data.mem)) {
			offline.push(node);
		    } 
		});

		if (offline.length == 0) {
		    return true;
		}

		return "Node " + offline.join(', ') + " seems to be offline!";
	    }
	});

        me.callParent();
    }
});