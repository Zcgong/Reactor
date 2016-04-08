/*!
 * Reactor
 * https://github.com/ShimShamSam/Reactor
 *
 * Copyright 2016 Samuel Hodge
 * Released under the GPL license
 * http://www.gnu.org/copyleft/gpl.html
 */
(function(context) {
	'use strict';

	// Export Reactor
	if(typeof module !== 'undefined' && module.exports) {
		module.exports = Reactor;
	}
	else if(typeof define === 'function' && define.amd) {
		define([], function() {
			return Reactor;
		});
	}
	else {
		context.Reactor = Reactor;
	}

	// The index of the top-level function currently running
	var top_function = null;

	// Top-level functions
	var top_functions = [];

	// A map of all functions to be called on the next reaction
	var pending_functions = {};

	// Reaction timeout ID
	var animation_frame = null;

	/**
	 * Constructor: Creates a reactive variable
	 * @param {*} default_value The default value
	 * -------------------------------------------------------------------------
	 * Function: Calls a function that can depend on reactive variables
	 * @param {Function} fn The function to call
	 */
	function Reactor(fn) {
		// Called as a constructor
		if(this instanceof Reactor) {
			var functions        = {};
			var current_value    = fn;
			var trigger_function = trigger.bind(functions);

			var reactor = function Reactor(value) {
				// Getting the value
				if(!arguments.length) {
					// Set a dependency on the top-level function
					if(top_function !== null) {
						functions[top_function] = true;
					}

					return current_value;
				}

				// Setting the value
				if(current_value !== value) {
					current_value = value;
					trigger_function();
				}
			};

			reactor.trigger = trigger_function;

			return reactor;
		}

		if(typeof fn !== 'function') {
			return;
		}

		// Called as a top-level function
		if(top_function === null) {
			top_function = top_functions.length;

			top_functions.push(fn);

			fn();

			top_function = null;

			return;
		}

		// Called as a nested function
		fn();
	}

	/**
	 * Queues a re-run of all functions dependent on a reactive variable
	 */
	function trigger() {
		for(var index in this) {
			pending_functions[index] = true;
		}

		if(animation_frame === null) {
			animation_frame = setTimeout(reaction, 0);
		}
	}

	/**
	 * Runs all pending functions triggered by reactive variables
	 */
	function reaction() {
		var functions = pending_functions;

		pending_functions = {};
		animation_frame  = null;

		for(var index in functions) {
			top_function = index;

			top_functions[index]();
		}

		top_function = null;
	}
}(this));
