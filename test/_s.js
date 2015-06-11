'use strict';

var test = require('tape');
var jockey = require('..');

//
// _s(arr, startIndex)
//

test('`arr` can be empty', function(t) {
  t.plan(1);
  var j = jockey();
  var arr = [];
  j._s(arr);
  t.looseEqual(arr, []);
});

test('`arr` can have a single element', function(t) {
  t.plan(1);
  var j = jockey();
  var arr = [1];
  j._s(arr);
  t.looseEqual(arr, [1]);
});

test('shuffles a subarray of `arr` starting from the specified `startIndex`', function(t) {
  t.plan(1);
  var j = jockey();
  var arr = [1, 2, 3];
  j._s(arr, 1);
  t.equal(arr[0], 1);
});
