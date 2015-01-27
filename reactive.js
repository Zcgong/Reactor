(function(context) {
	'use strict';

	if(!context) {
		return;
	}

	context.Reactive = {
		"run" : ReactiveRun,
		"var" : ReactiveVar
	};

	var top_func      = null;
	var pending_funcs = [];
	var pending_flush = false;

	function ReactiveRun(func, context) {
		var top_level = !top_func;

		if(top_level) {
			top_func = func.bind(context);
		}

		func.call(context);

		if(top_level) {
			top_func = null;
		}
	}

	function ReactiveVar(initial_value) {
		this._value = initial_value;
		this._funcs = [];
	}

	ReactiveVar.prototype.get = function() {
		var funcs = this._funcs;

		if(top_func && funcs.indexOf(top_func) === -1) {
			funcs.push(top_func);
		}

		return this._value;
	};

	ReactiveVar.prototype.set = function(new_value) {
		if(this._value === new_value) {
			return;
		}

		this._value = new_value;

		flush(this._funcs);
	};

	function flush(funcs) {
		for(var i = 0; i < funcs.length; ++i) {
			var func = funcs[i];

			if(pending_funcs.indexOf(func) === -1) {
				pending_funcs.push(func);
			}
		}

		if(!pending_flush) {
			pending_flush = true;

			setTimeout(function() {
				for(var i = 0; i < pending_funcs.length; ++i) {
					pending_funcs[i]();
				}

				pending_funcs = [];
				pending_flush = false;
			}, 0);
		}
	}
}(this));
