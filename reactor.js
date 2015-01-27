(function(context) {
	'use strict';

	reactor.run     = run;
	context.Reactor = reactor;

	var top_id        = null;
	var functions     = [];
	var contexts      = [];
	var pending_ids   = {};
	var pending_order = [];
	var pending_flush = false;

	function reactor(initial_value) {
		var ids   = {};
		var order = [];
		var value = initial_value;

		return function(new_value) {
			if(arguments.length === 0) {
				if(top_id !== null && !ids[top_id]) {
					ids[top_id] = true;
					order.push(top_id);
				}

				return value;
			}

			if(value !== new_value) {
				value = new_value;
				flush(order);
			}
		};
	}

	function run(body, context) {
		if(top_id !== null) {
			body.call(context);
			return;
		}

		pending_order.push(functions.length);

		functions.push(body);
		contexts.push(context);

		reaction();
	}

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
