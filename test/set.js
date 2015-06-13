'use strict';

var test = require('tape');
var jockey = require('..');

//
// set(i, item)
//

test('throws if no `i`', function(t) {
  t.plan(2);
  var j = jockey([1, 2, 3]);
  t.throws(function() {
    j.set();
  });
  t.looseEqual(j.items, [1, 2, 3]);
});

test('throws if no `item`', function(t) {
  t.plan(2);
  var j = jockey([1, 2, 3]);
  t.throws(function() {
    j.set(0);
  });
  t.looseEqual(j.items, [1, 2, 3]);
});

test('throws for invalid `i`', function(t) {
  t.plan(2);
  var j = jockey([1, 2, 3]);
  t.throws(function() {
    j.set(3, 'x');
  });
  t.looseEqual(j.items, [1, 2, 3]);
});

test('updates the item at the specified index `i`', function(t) {
  t.plan(1);
  var j = jockey([1, 2, 3]);
  j.set(1, 'x');
  t.looseEqual(j.items, [1, 'x', 3]);
});

test('updates `this.shuffled`', function(t) {
  t.plan(5);
  var j = jockey([1, 2, 3]);
  // shuffle
  j._s = function(arr, startIndex) {
    t.looseEqual(arr, [1, 2, 3]);
    t.equal(startIndex, 0);
    arr[0] = 2;
    arr[1] = 3;
    arr[2] = 1;
  };
  j.shuffle();
  t.looseEqual(j.shuffled, [2, 3, 1]);
  // set
  j.set(1, 'x');
  t.looseEqual(j.items, [1, 'x', 3]);
  t.looseEqual(j.shuffled, ['x', 3, 1]);
});
