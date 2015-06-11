'use strict';

var test = require('tape');
var jockey = require('..');

//
// get([i])
//

test('returns the items if no `i` specified', function(t) {
  t.plan(1);
  var j = jockey([1, 2, 3]);
  t.looseEqual(j.get(), [1, 2, 3]);
});

test('throws for invalid `i`', function(t) {
  t.plan(2);
  var j = jockey([1, 2, 3]);
  t.throws(function() {
    j.get(-1);
  });
  t.throws(function() {
    j.get(3);
  });
});

test('get the item at index `i`', function(t) {
  t.plan(3);
  var j = jockey([1, 2, 3]);
  t.equal(j.get(0), 1);
  t.equal(j.get(1), 2);
  t.equal(j.get(2), 3);
});
