var merge = require('merge');
var cacheChain = require('cache-chain');
module.exports = function(option) {

	function backend(option) {

		option = merge(true, {depth: 1000}, option);

		var stack = [];	// Keeps track of access order and length
		var store = {}; // Maps quickly to data

		this.set = function(key, value, options, cb) {
			if(store[key]) {
				clearTimeout(store[key].timeout);
			}
			store[key] = {
				v: value,
				timeout: setTimeout(function() {
					delete store[key];
				}, options.ttl)
			};
			stack.unshift(key);
			// Callback and resize are inversed on purpose to improve speed.
			cb();
			resize();
		};

		this.get = function(key, options, cb) {			
			if (store[key]) {
				cb(null, store[key].v);
				stack.unshift(stack.pop());
			} else {
				cb(new cacheChain.error.notFound);
//				cb(new Error('Key not found'));
			}
		};

		this.delete = function(key, options, cb) {
			remove(key);
			cb();
		};

		this.depth = function() {
			return stack.length;
		}

		function remove(key) {
			if (store[key]) {
				clearTimeout(store[key].timeout);
				delete store[key];
			}
		};

		function resize() {
			var i = stack.length - 1;
			while(i >= option.depth) {
				remove(stack.pop());
				i--;
			}
		}
	}
	return new backend(option);
};
