(function(context) {
	'use strict';

	// Expose Reactor to the current context
	context["Reactor"] = Reactor;

	// The ID of the top most function currently running within Reactor.run
	var top_id = null;

	// Top-level functions
	var functions = [];

	// A map of all functions to be called on the next flush
	var pending_ids = {};

	// The order in which the functions will be called on the next flush
	var pending_order = [];

	// True if a flush is already scheduled
	var pending_flush = false;

	/**
	 * Reactive variable
	 * @param {*} initial_value The initial value
	 * @constructor
	 */
	function Reactor(initial_value) {
		if(!(this instanceof Reactor)) {
			return new Reactor(initial_value);
		}

		this._ids   = {};
		this._order = [];
		this._value = initial_value;
	}

	/**
	 * Gets the value of a reactive variable.
	 * If called within Reactor.run, the function will be re-run when the value
	 * changes.
	 * @return {*} The current value
	 */
	Reactor.prototype.get = function get() {
		if(top_id !== null && !this._ids[top_id]) {
			this._ids[top_id] = true;
			this._order.push(top_id);
		}

		return this._value;
	};

	/**
	 * Sets the value of a reactive variable.
	 * Queues a re-run of any functions called by Reactor.run that rely on the
	 * value.
	 * @param {*} new_value The new value
	 */
	Reactor.prototype.set = function set(new_value) {
		if(this._value !== new_value) {
			this._value = new_value;
			flush(this._order);
		}
	};

	/**
	 * Runs a function with an optional context.
	 * If get() is called on reactive variables within the function, the
	 * function is registered to re-run if the value changes.
	 * @param  {Function} body    The function to run
	 * @param  {Object}   context The context of the function ("this")
	 */
	Reactor.run = function run(body, context) {
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
		for(var i = 0; i < pending_order.length; ++i) {
			top_id = pending_order[i];

			var fn = functions[top_id]

			fn.body.call(fn.context);
		}

		top_id        = null;
		pending_ids   = {};
		pending_order = [];
		pending_flush = false;
	}

	/**
	 * Queues an array of function IDs to be run
	 * @param {Array} ids An array of function IDs
	 */
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
