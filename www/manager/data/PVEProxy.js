Ext.define('PVE.RestProxy', {
    extend: 'Ext.data.RestProxy',
    alias : 'proxy.pve',

    constructor: function(config) {
	var me = this;

	config = config || {};

	Ext.applyIf(config, {
	    pageParam : null,
	    startParam: null,
	    limitParam: null,
	    groupParam: null,
	    sortParam: null,
	    filterParam: null,
	    noCache : false,
	    reader: {
		type: 'json',
		root: 'data'
	    }
	});

	me.callParent([config]); 
    }

}, function() {

    Ext.define('pve-domains', {
	extend: "Ext.data.Model",
	fields: [ 'realm', 'type', 'comment', 'default' ],
	proxy: {
	    type: 'pve',
	    url: "/api2/json/access/domains"
	}
    });

    Ext.define('KeyValue', {
	extend: "Ext.data.Model",
	fields: [ 'key', 'value' ],
	idProperty: 'key'
    });

    Ext.define('pve-string-list', {
	extend: 'Ext.data.Model',
	fields:  [ 'n', 't' ],
	idProperty: 'n'
    });

    Ext.define('pve-tasks', {
	extend: 'Ext.data.Model',
	fields:  [ 
	    { name: 'starttime', type : 'date', dateFormat: 'timestamp' }, 
	    { name: 'endtime', type : 'date', dateFormat: 'timestamp' }, 
	    { name: 'pid', type: 'int' },
	    'node', 'upid', 'user', 'status', 'type', 'id'
	],
	idProperty: 'upid'
    });

    Ext.define('pve-cluster-log', {
	extend: 'Ext.data.Model',
	fields:  [ 
	    { name: 'uid' , type: 'int' },
	    { name: 'time', type : 'date', dateFormat: 'timestamp' }, 
	    { name: 'pri', type: 'int' },
	    { name: 'pid', type: 'int' },
	    'node', 'user', 'tag', 'msg',
	    {
		name: 'id',
		convert: function(value, record) {
		    var info = record.data;
		    var text;

		    if (value) {
			return value;
		    }
		    // compute unique ID
		    return info.uid + ':' + info.node;
		}
	    }
	],
	idProperty: 'id'
    });
});