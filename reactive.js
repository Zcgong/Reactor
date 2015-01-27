(function(context) {
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
		var value = initial_value;
		var funcs = [];

		this.get = get;
		this.set = set;

		function get() {
			var current = current_func;

			if(current && funcs.indexOf(current) === -1) {
				funcs.push(current);
			}

			return value;
		}

		function set(new_value) {
			if(value === new_value) {
				return;
			}

			value = new_value;

			flush(funcs);
		}
	}

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
				flushing = true;

				for(var i = 0; i < pending_funcs.length; ++i) {
					funcs[i]();
				}

				pending_funcs = [];
				pending_flush = false;
				flushing      = false;
			}, 0);
		}
	}
}(this));
