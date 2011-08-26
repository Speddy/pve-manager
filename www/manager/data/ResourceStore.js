Ext.define('PVE.data.ResourceStore', {
    extend: 'PVE.data.UpdateStore',
    requires: ['PVE.Utils'],
    singleton: true,

    findNextVMID: function() {
	var me = this, i;
	
	for (i = 100; i < 10000; i++) {
	    if (me.findExact('vmid', i) < 0) {
		return i;
	    }
	}
    },

    findVMID: function(vmid) {
	var me = this, i;
	
	return (me.findExact('vmid', parseInt(vmid, 10)) >= 0);
    },

 
    constructor: function(config) {
	// fixme: how to avoid those warnings
	/*jslint confusion: true */

	var me = this;

	config = config || {};

	var field_defaults = {
	    type: {
		header: 'Type',
		type: 'text',
		renderer: PVE.Utils.render_resource_type,
		sortable: true,
		hideable: false,
		width: 80
	    },
	    id: {
		header: 'ID',
		type: 'text',
		hidden: true,
		sortable: true,
		width: 80
	    },
	    running: {
		type: 'boolean',
		hidden: true,
		convert: function(value, record) {
		    var info = record.data;
		    if (info.type === 'qemu' || info.type === 'openvz') {
			return (Ext.isNumeric(info.uptime) && (info.uptime > 0));
		    } else {
			return false;
		    }
		}
	    },
	    text: {
		header: 'Text',
		type: 'text',
		sortable: true,
		width: 200,
		convert: function(value, record) {
		    var info = record.data;
		    var text;

		    if (value) {
			return value;
		    }

		    if (info.type === 'node') {
			text = info.node;
		    } else if (info.type === 'storage') {
			text = info.storage + ' (' + info.node + ')';
		    } else if (info.type === 'qemu' || info.type === 'openvz') {
			text = String(info.vmid);
			if (info.name) {
			    text += " (" + info.name + ')';
			}
		    } else {
			text = info.id;
		    }
		    return text;
		}
	    },
	    vmid: {
		header: 'VMID',
		type: 'integer',
		hidden: true,
		sortable: true,
		width: 80
	    },
	    name: {
		header: 'Name',
		hidden: true,
		sortable: true,
		type: 'text'
	    },
	    disk: {
		header: 'Disk usage',
		type: 'integer',
		renderer: PVE.Utils.render_disk_usage,
		sortable: true,
		width: 100
	    },
	    maxdisk: {
		header: 'Disk size',
		type: 'integer',
		renderer: PVE.Utils.render_size,
		sortable: true,
		hidden: true,
		width: 100
	    },
	    mem: {
		header: 'Memory usage',
		type: 'integer',
		renderer: PVE.Utils.render_mem_usage,
		sortable: true,
		width: 100
	    },
	    maxmem: {
		header: 'Mem size',
		type:'integer',
		renderer: PVE.Utils.render_size,
		hidden: true,
		sortable: true,
		width: 100
	    },
	    cpu: {
		header: 'CPU usage',
		type: 'float',
		renderer: PVE.Utils.render_cpu,
		sortable: true,
		width: 100
	    },
	    maxcpu: {
		header: 'maxcpu',
		type: 'integer',
		hidden: true,
		sortable: true,
		width: 60
	    },
	    uptime: {
		header: 'Uptime',
		type: 'integer',
		renderer: PVE.Utils.render_uptime,
		sortable: true,
		width: 110
	    }, 
	    node: {
		header: 'Node',
		type: 'text',
		hidden: true,
		sortable: true,
		width: 110
	    },
	    storage: {
		header: 'Storage',
		type: 'text',
		hidden: true,
		sortable: true,
		width: 110
	    }
	};

	var fields = [];
	var fieldNames = [];
	Ext.Object.each(field_defaults, function(key, value) {
	    if (!Ext.isDefined(value.convert)) {
		fields.push({name: key, type: value.type});
		fieldNames.push(key);
	    } else if (key === 'text' || key === 'running') { 
		fields.push({name: key, type: value.type, convert: value.convert});
		fieldNames.push(key);
	    }		
	});

	Ext.define('PVEResources', {
	    extend: "Ext.data.Model",
	    fields: fields,
	    proxy: {
		type: 'pve',
		url: '/api2/json/cluster/resources'
	    }
	});

	Ext.define('PVETree', {
	    extend: "Ext.data.Model",
	    fields: fields,
	    proxy: { type: 'memory' }
	});

	Ext.apply(config, {
	    storeid: 'PVEResources',
	    model: 'PVEResources',
	    autoDestory: false,
	    defaultColums: function() {
		var res = [];
		Ext.Object.each(field_defaults, function(field, info) {
		    var fi = Ext.apply({ dataIndex: field }, info);
		    res.push(fi);
		});
		return res;
	    },
	    fieldNames: fieldNames
	});

	me.callParent([config]);
    }
});