'use strict';

var test = require('tape');
var jockey = require('..');

//
// jockey([items])
//

test('is a function', function(t) {
  t.plan(1);
  t.true(typeof jockey === 'function');
});

test('can be called without the `new` keyword', function(t) {
  t.plan(1);
  var j = jockey();
  t.true(typeof j === 'object');
});

test('takes an array of `items`', function(t) {
  t.plan(2);
  var items = [1, 2, 3];
  var j = jockey(items);
  t.equal(j.items, items);
  t.looseEqual(items, [1, 2, 3]);
});
