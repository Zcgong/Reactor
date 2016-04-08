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

	var functions = [];
	var chain     = [];
	var pending   = {};
	var timeout   = null;

	/**
	 * As a constructor: Creates a reactive variable with an optional default value
	 * As a function: Calls the passed in function which can depend on reactive variables
	 * @param {*|Function} value The default value | The function to call
	 */
	function Reactor(value) {
		if(this instanceof Reactor) {
			var dependents = {};

			var reactor = function Reactor(new_value) {
				if(!arguments.length) {
					if(chain.length) {
						var index = chain[chain.length - 1];

						dependents[index] = true;
					}

					return value;
				}
				else if(value !== new_value) {
					value = new_value;
					trigger(dependents);
				}
			};

			reactor.trigger = trigger.bind(null, dependents);

			return reactor;
		}
		else if(typeof value === 'function') {
			call(functions.push(value) - 1);
		}
	}

	/**
	 * Queues up reactive functions and schedules a reaction
	 * @param {Object} functions The reactive functions to queue
	 */
	function trigger(functions) {
		for(var index in functions) {
			pending[index] = true;
		}

		if(timeout === null) {
			timeout = setTimeout(reaction, 0);
		}
	}

	/**
	 * Runs all scheduled reactive functions
	 */
	function reaction() {
		var functions = pending;

		pending = {};
		timeout = null;

		for(var index in functions) {
			call(index);
		}
	}

	/**
	 * Calls a function based on its index
	 * @param {Number} index The index of the function
	 */
	function call(index) {
		chain.push(index);
		functions[index]();
		chain.pop();
	}
}(this));
