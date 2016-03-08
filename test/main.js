var cc = require('cache-chain');
var async = require('async');

describe('Main Tests for cache-chain-memory', function() {

	var di = {
		chain: null,
		cc: require('cache-chain')
	}

	var chain;

	beforeEach(function(done) {
		di.chain = di.cc.chain({
			ttl: 10000,
			stale: 10000 * 2
		});
		var layer = di.cc.layer(require('../index.js')({
			depth: 1000
		}));
		di.chain.append(layer);
		done();
	});

	require('cache-chain/test/integration')(di);

	describe('Memcached Specific Tests', function() {
		it('Has to respect memory store depth', function(done) {
			var key = 'key';
			var value = 'value';
			var d = 3;
			chain = di.cc.chain({
				ttl: 10000,
				stale: 10000 * 2
			});
			var backend = require('../index.js')({
				depth: d
			});
			var layer = di.cc.layer(backend);
			chain.append(layer);
			var set = [];
			var i = 0;
			while (i < 5) {
				set.push(function(callback) {
					chain.set('key' + this.i, 'value', function(err, result) {
						callback(null, err);
					})
				}.bind({i: i}))
				i++;
			}
			async.series(
				set,
				function(err, results) {
					setTimeout(function() {
						if(backend.depth() == d) {
							done();
						} else {
							done('Memory store depth has returned unexpected results');
						}
					}, 5);
				}
			)
		});
	})
});
