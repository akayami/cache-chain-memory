var cc = require('../../cache-chain');
var async = require('async');

describe('Main Tests for cache-chain-memory', function() {

	var chain;

	beforeEach(function() {
		chain = cc.chain({
			ttl: 10000,
			stale: 10000 * 2
		});
		var layer = cc.layer(require('../index.js')({
			depth: 1000
		}));
		chain.append(layer);
	});

	it('It needs to set a value', function(done) {
		var key = 'key';
		var value = 'value';
		chain.set(key, value, function(err, reply) {
			if (err) {
				done(err);
			} else {
				chain.get(key, function(err, reply) {
					if (reply === value) {
						done();
					} else {
						done(err);
					}
				});
			}
		})
	});

	it('It needs to retrive a set value', function(done) {
		var key = 'key';
		var value = 'value';
		chain.set(key, value, function(err, reply) {
			if (err) {
				done(err);
			} else {
				chain.get(key, function(err, reply) {
					if (err) {
						done(err);
					} else {
						if (reply == value) {
							done();
						} else {
							done(reply)
						}
					}
				})
			}
		})
	});

	it('It needs to delete a set value', function(done) {
		var key = 'key';
		var value = 'value';
		chain.set(key, value, function(err, reply) {
			if (err) {
				done(err);
			} else {
				chain.delete(key, function(err) {
					if (err) {
						cb(err);
					} else {
						chain.get(key, function(err, reply) {
							if (err) {
								if(err instanceof cc.error.notFound) {
									done();
								} else {
									done('Wrong error message returned');
								}
							} else {
								done('Expected error message. Got correct reply instead')
							}
						})
					}
				})
			}
		})
	});

	it('A value needs to timeout', function(done) {
		var key = 'key';
		var value = 'value';
		chain.set(key, value, {
			ttl: 10,
			stale: 5
		}, function(err, reply) {
			if (err) {
				done(err);
			} else {
				setTimeout(function() {
					chain.get(key, function(err, reply) {
						if (err) {
							if(err instanceof cc.error.notFound) {
								done();
							} else {
								done('Wrong error message returned');
							}
						} else {
							done('Expected error message. Got correct reply instead')
						}
					})
				}, 15);
			}
		})
	});

	it('Has to respect memory store depth', function(done) {
		var key = 'key';
		var value = 'value';
		var d = 3;
		chain = cc.chain({
			ttl: 10000,
			stale: 10000 * 2
		});
		var backend = require('../index.js')({
			depth: d
		});
		var layer = cc.layer(backend);
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
});
