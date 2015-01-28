(function(context) {
	'use strict';

	// Expose Reactor to the current context
	context['Reactor'] = Reactor;

	// The ID of the top most function currently running within Reactor.run
	var top_id = null;

	// Top-level functions
	var functions = [];

	// A map of all functions to be called on the next reaction
	var pending_ids = {};

	// The order in which the functions will be called on the next reaction
	var pending_order = [];

	// True if an reaction is already scheduled
	var pending_reaction = false;

	/**
	 * Reactive variable constructor
	 * If not called as a constructor, a function and optional context can be
	 * passed that becomes dependent on variables used within it
	 * @param {*} initial_value The initial value
	 */
	function Reactor(initial_value) {
		// If not called as a constructor, pass the arguments to run()
		if(!(this instanceof Reactor)) {
			run.apply(null, arguments);
			return;
		}

		this._ids   = {};
		this._order = [];
		this._value = initial_value;
	}

	/**
	 * Registers the current call to Reactor.run as dependent on this variable
	 */
	Reactor.prototype.depend = function depend() {
		if(top_id !== null && !this._ids[top_id]) {
			this._ids[top_id] = true;
			this._order.push(top_id);
		}
	}

	/**
	 * Queues a re-run of all dependent functions
	 */
	Reactor.prototype.act = function act() {
		var order = this._order;

		for(var i = 0; i < order.length; ++i) {
			var id = order[i];

			if(!pending_ids[id]) {
				pending_ids[id] = true;
				pending_order.push(id);
			}
		}

		if(!pending_reaction) {
			pending_reaction = true;
			setTimeout(reaction, 0);
		}
	};

	/**
	 * Gets the value
	 * changes.
	 * @return {*} The current value
	 */
	Reactor.prototype.get = function get() {
		this.depend();
		return this._value;
	};

	/**
	 * Sets the value
	 * @param {*} new_value The new value
	 */
	Reactor.prototype.set = function set(new_value) {
		if(this._value !== new_value) {
			this._value = new_value;
			this.act();
		}
	};

	/**
	 * Runs a function and tracks reactive variables within it
	 * @param  {Function} body    The function to run
	 * @param  {Object}   context The context of the function ("this")
	 */
	function run(body, context) {
		var type = typeof body;

		if(type !== 'function') {
			throw new Error('Expected function, found ' + type);
		}

		if(top_id !== null) {
			body.call(context);
			return;
		}

		pending_order.push(functions.length);

		functions.push({
			body    : body,
			context : context
		});

		reaction();
	};

	/**
	 * Runs all pending functions triggered by reactive variables
	 */
	function reaction() {
		var order = pending_order;

		pending_ids      = {};
		pending_order    = [];
		pending_reaction = false;

		for(var i = 0; i < order.length; ++i) {
			top_id = order[i];

			var fn = functions[top_id];

			fn.body.call(fn.context);
		}

		top_id = null;
	}
}(this));
