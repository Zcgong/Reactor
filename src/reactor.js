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

	var counter = 0;
	var current = null;
	var pending = {};
	var timeout = null;

	/**
	 * As a constructor: Creates a reactive variable with an optional default value
	 * As a function: Calls the passed in function which can depend on reactive variables
	 * @param {*|Function} value The default value | The function to call
	 */
	function Reactor(value) {
		if(this instanceof Reactor) {
			var reactor = function Reactor(new_value) {
				if(!arguments.length) {
					if(current) {
						reactor.dependents[current.id] = current;
						current.reactors[reactor.id]   = reactor;
					}

					return value;
				}
				else if(value !== new_value) {
					value = new_value;
					reactor.trigger();
				}
			};

			reactor.id         = counter++;
			reactor.dependents = {};
			reactor.trigger    = trigger.bind(reactor);

			return reactor;
		}
		else if(typeof value === 'function') {
			call({
				id       : counter++,
				body     : value,
				reactors : {},
				children : {},
			});
		}
	}

	/**
	 * Adds a reactive variable to the queue to be processed in the next reaction
	 */
	function trigger() {
		pending[this.id] = this;

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

		for(var id in reactors) {
			var reactor = reactors[id];

			for(var fn_id in reactor.dependents) {
				if(!functions[fn_id]) {
					functions[fn_id] = true;

					var fn = reactor.dependents[fn_id];

					clear(fn, functions);
					call(fn);
				}
			}
		}
	}

	/**
	 * Calls a reactive function
	 * @param {Object} fn The reactive function to call
	 */
	function call(fn) {
		var previous = current;

		if(current) {
			current.children[fn.id] = fn;
		}

		current = fn;
		fn.body();
		current = previous;
	}

	/**
	 * Clears a reactive function's dependencies and nested reactive functions
	 * @param {Object} fn The reactive function to clear
	 */
	function clear(fn) {
		for(var id in fn.reactors) {
			delete fn.reactors[id].dependents[fn.id];
		}

		for(var id in fn.children) {
			clear(fn.children[id]);
		}

		fn.reactors = {};
		fn.children = {};
	}
}(this));
