(function(context) {
	'use strict';

	if(!context) {
		return;
	}

	context.Reactive = {
		"run" : ReactiveFunc,
		"var" : ReactiveVar
	};

	var current_func  = null;
	var pending_funcs = [];
	var pending_flush = false;

	function ReactiveFunc(func, context) {
		function current() {
			func.call(context);
		};

		if(!current_func) {
			current_func = current;
		}

		current();

		current_func = null;
	}

	function ReactiveVar(initial_value) {
		this._value = initial_value;
		this._funcs = [];
	}

	ReactiveVar.prototype.get = function() {
		var funcs   = this._funcs;
		var current = current_func;

		if(current && funcs.indexOf(current) === -1) {
			funcs.push(current);
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
					funcs[i]();
				}

				pending_funcs = [];
				pending_flush = false;
			}, 0);
		}
	}
}(this));
