(function(context) {
	'use strict';

	context.Reactor = Reactor;

	var top_id        = null;
	var functions     = [];
	var contexts      = [];
	var pending_ids   = {};
	var pending_order = [];
	var pending_flush = false;

	function Reactor(initial_value) {
		if(!(this instanceof Reactor)) {
			return new Reactor(initial_value);
		}

		this._ids   = {};
		this._order = [];
		this._value = initial_value;
	}

	Reactor.prototype.get = function get() {
		if(top_id !== null && !this._ids[top_id]) {
			this._ids[top_id] = true;
			this._order.push(top_id);
		}

		return this._value;
	};

	Reactor.prototype.set = function set(new_value) {
		if(this._value !== new_value) {
			this._value = new_value;
			flush(this._order);
		}
	};

	Reactor.run = function run(body, context) {
		if(top_id !== null) {
			body.call(context);
			return;
		}

		pending_order.push(functions.length);

		functions.push(body);
		contexts.push(context);

		reaction();
	};

	function reaction() {
		for(var i = 0; i < pending_order.length; ++i) {
			top_id = pending_order[i];
			functions[top_id].call(contexts[top_id]);
		}

		top_id        = null;
		pending_ids   = {};
		pending_order = [];
		pending_flush = false;
	}

	function flush(ids) {
		for(var i = 0; i < ids.length; ++i) {
			var id = ids[i];

			if(!pending_ids[id]) {
				pending_ids[id] = true;
				pending_order.push(id);
			}
		}

		if(!pending_flush) {
			pending_flush = true;
			setTimeout(reaction, 0);
		}
	}
}(this));
