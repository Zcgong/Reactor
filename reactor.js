(function(context) {
	'use strict';

	// Expose Reactor to the current context
	context.Reactor = Reactor;

	// The ID of the top most function currently running
	var top_function = null;

	// Top-level functions
	var all_functions = [];

	// A map of all functions to be called on the next reaction
	var pending_functions = {};

	// Reaction timeout
	var pending_reaction = null;

	/**
	 * Constructor: Creates a reactive variable
	 * #param {*} default_value The default value
	 * -----
	 * Function: Calls a function with an optional context
	 * @param {Function} body    The function to call
	 * @param {Object}   context The context of the function ("this")
	 */
	function Reactor(body, context) {
		// Called as a constructor
		if(this instanceof Reactor) {
			this._value     = body;
			this._functions = {};
		}
		// Called as a function
		else {
			if(typeof body !== 'function') {
				throw new Error('Expected function, found ' + typeof body);
			}

			if(top_function === null) {
				top_function = all_functions.length;

				all_functions.push({
					body    : body,
					context : context
				});

				body.call(context);

				top_function = null;
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
		if(top_function !== null && !this._functions[top_function]) {
			this._functions[top_function] = true;
		}
	}

	/**
	 * Queues a re-run of all dependent functions
	 */
	Reactor.prototype.act = function act() {
		for(var id in this._functions) {
			pending_functions[id] = true;
		}

		if(pending_reaction === null) {
			pending_reaction = setTimeout(reaction, 0);
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
		var functions = pending_functions;

		pending_functions = {};
		pending_reaction  = null;

		for(var id in functions) {
			top_function = id;

			var fn = all_functions[id];

			fn.body.call(fn.context);
		}

		top_function = null;
	}
}(this));
