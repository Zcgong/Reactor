/*!
 * Reactor
 * https://github.com/ShimShamSam/Reactor
 *
 * Copyright 2016 Samuel Hodge
 * Released under the GPL license
 * http://www.gnu.org/copyleft/gpl.html
 */
(function scope(context) {
	'use strict';

	if(typeof module !== 'undefined' && module.exports) {
		module.exports = Reactor;
	}
	else if(typeof define === 'function' && define.amd) {
		define([], function defineReactor() {
			return Reactor;
		});
	}
	else {
		context.Reactor = Reactor;
	}

	var counter = 0;
	var current = null;
	var pending = {};
	var timeout = null;

	/**
	 * Creates a reactive variable
	 * @constructor
	 * @param {*=} value - A default value
	 * @returns {Function} A function used to get/set the value
	 *//**
	 * Calls a function which can depend on reactive variables
	 * @param {Function} value   - A function to call
	 * @param {*=}       context - A context to call the function in
	 */
	function Reactor(value, context) {
		// Called as a constructor
		if(this instanceof Reactor) {
			var data = {
				id    : counter++,
				deps  : {},
				value : value
			};

			var fn = function Reactor() {
				return getSet.apply(data, arguments);
			};

			fn.trigger = function trigger() {
				triggerReaction(data);
			};

			return fn;
		}
		// Called as a function
		else if(typeof value === 'function') {
			call({
				id       : counter++,
				body     : value,
				context  : context,
				reactors : {},
				children : {},
				parent   : null
			});
		}
	}

	/**
	 * Gets or sets a reactive variable's value
	 * @param {*=} value - If an argument is passed, the reactive variable is set to that value
	 * @returns {*} The value of the reactive variable
	 */
	function getSet(value) {
		// If no arguments are passed in, the value is being retrieved
		if(!arguments.length) {
			// If a reactive function is running, mark it's dependency on this variable
			if(current) {
				this.deps[current.id]     = current;
				current.reactors[this.id] = this.deps;
			}
		}
		// If an argument was passed in, trigger a reaction if the value has changed
		else if(this.value !== value) {
			this.value = value;
			triggerReaction(this);
		}

		return this.value;
	}

	/**
	 * Adds a reactive variable to the queue to be processed in the next reaction
	 * @param {Object} data - The reactive variable's data
	 */
	function triggerReaction(data) {
		pending[data.id] = data.deps;

		if(timeout === null) {
			timeout = setTimeout(reaction, 0);
		}
	}

	/**
	 * Runs all scheduled reactive functions
	 */
	function reaction() {
		var reactors  = pending;
		var functions = {};

		pending = {};
		timeout = null;

		// Get a unique list of all functions that need to be ran
		for(var id in reactors) {
			var deps = reactors[id];

			for(var fn_id in deps) {
				functions[fn_id] = deps[fn_id];
			}
		}

		// Run the functions
		for(var id in functions) {
			var fn = functions[id];

			// Don't run functions if they have a parent that is also scheduled to run
			if(!fn.parent || !functions[fn.parent.id]) {
				clear(fn);
				call(fn);
			}
		}
	}

	/**
	 * Calls a reactive function
	 * @param {Object} fn - The reactive function to call
	 */
	function call(fn) {
		if(current) {
			fn.parent               = current;
			current.children[fn.id] = fn;
		}

		var previous = current;

		current = fn;

		var error = tryCatch(fn.body, fn.context);

		current = previous;

		if(error) {
			throw error;
		}
	}

	/**
	 * Clears a function's dependencies and child functions
	 * @param {Object} fn - The reactive function to clear
	 */
	function clear(fn) {
		// Delete this function from its reactors' dependency lists
		for(var id in fn.reactors) {
			delete fn.reactors[id][fn.id];
		}

		// Clear child functions
		for(var id in fn.children) {
			clear(fn.children[id]);
		}

		fn.reactors = {};
		fn.children = {};
	}

	/**
	 * Calls a function in an isolated try/catch. See link below for details.
	 * https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#2-unsupported-syntax
	 * @param {Function} fn      - The function to run
	 * @param {Object=}  context - The context in which to call the function
	 * @returns {Error|undefined} An error if one occurred
	 */
	function tryCatch(fn, context) {
		try {
			fn.call(context);
		}
		catch(e) {
			return e;
		}
	}
}(this));
