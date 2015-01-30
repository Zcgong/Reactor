(function(context) {
	'use strict';

	// Expose Reactor to the current context
	context.Reactor = Reactor;

	// The ID of the top most function currently running
	var top_id = null;

	// Top-level functions
	var functions = [];

	// A map of all functions to be called on the next reaction
	var pending_ids = {};

	// The order in which the functions will be called on the next reaction
	var pending_order = [];

	// True if a reaction is already scheduled
	var pending_reaction = false;

	/**
	 * Constructor: Creates a reactive variable
	 * #param {*} default_value The default value
	 * -------------------------------------------------------------------------
	 * Function: Calls a function with an optional context
	 * @param {Function} body    The function to call
	 * @param {Object}   context The context of the function ("this")
	 */
	function Reactor(body, context) {
		// Called as a constructor
		if(this instanceof Reactor) {
			this._ids   = {};
			this._order = [];
			this._value = body;
		}
		// Called as a function
		else {
			if(typeof body !== 'function') {
				throw new Error('Expected function, found ' + typeof body);
			}

			if(top_id === null) {
				top_id = functions.length;

				functions.push({
					body    : body,
					context : context
				});

				body.call(context);

				top_id = null;
			}
			else {
				body.call(context);
			}
		}
	}

	/**
	 * Registers the current top-level function as dependent on this variable
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
