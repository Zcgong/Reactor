(function(context) {
	'use strict';

	if(!context) {
		return;
	}

	context.Reactive = {
		"run" : ReactiveRun,
		"var" : ReactiveVar
	};

	var top_id        = null;
	var funcs         = [];
	var pending_ids   = {};
	var pending_order = [];
	var pending_flush = false;

	function ReactiveRun(func, context) {
		if(top_id !== null) {
			func.call(context);
			return;
		}

		var id = funcs.length;

		funcs.push(function ReactiveRunOuter() {
			top_id = id;
			func.call(context);
			top_id = null;
		});

		funcs[id]();
	}

	function ReactiveVar(initial_value) {
		this._ids   = {};
		this._order = [];
		this._value = initial_value;
	}

	ReactiveVar.prototype.get = function() {
		if(top_id !== null && !this._ids[top_id]) {
			this._ids[top_id] = true;
			this._order.push(top_id);
		}

		return this._value;
	};

	ReactiveVar.prototype.set = function(new_value) {
		if(this._value !== new_value) {
			this._value = new_value;
			flush(this._order);
		}
	};

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

			setTimeout(function() {
				for(var i = 0; i < pending_order.length; ++i) {
					var id = pending_order[i];

					funcs[id]();
				}

				pending_ids   = {};
				pending_order = [];
				pending_flush = false;
			}, 0);
		}
	}
}(this));
