'use strict';

var test = require('tape');
var jockey = require('..');

//
// remove(i)
//

test('throws for invalid `i`', function(t) {
  t.plan(2);
  var j = jockey([1, 2, 3]);
  t.throws(function() {
    j.remove(-1);
  });
  t.throws(function() {
    j.remove(3);
  });
});

test('remove from start', function(t) {
  t.plan(1);
  var j = jockey([1, 2, 3]);
  j.remove(0);
  t.looseEqual(j.items, [2, 3]);
});

test('remove from middle', function(t) {
  t.plan(1);
  var j = jockey([1, 2, 3]);
  j.remove(1);
  t.looseEqual(j.items, [1, 3]);
});

test('remove from end', function(t) {
  t.plan(1);
  var j = jockey([1, 2, 3]);
  j.remove(2);
  t.looseEqual(j.items, [1, 2]);
});

test('remove while playing, `i` < current index', function(t) {
  t.plan(4);
  var j = jockey([1, 2, 3]);
  // play
  j.play(1);
  t.looseEqual(j.items, [1, 2, 3]);
  t.equal(j.getCurrentIndex(), 1);
  // remove
  j.remove(0);
  t.looseEqual(j.items, [2, 3]);
  t.equal(j.getCurrentIndex(), 0);
});

test('remove while playing, `i` == current index', function(t) {
  t.plan(4);
  var j = jockey([1, 2, 3]);
  // play
  j.play(1);
  t.looseEqual(j.items, [1, 2, 3]);
  t.equal(j.getCurrentIndex(), 1);
  // remove
  j.remove(1);
  t.looseEqual(j.items, [1, 3]);
  t.equal(j.getCurrentIndex(), -1);
});

test('remove while playing, `i` > current index', function(t) {
  t.plan(3);
  var j = jockey([1, 2, 3]);
  // play
  j.play(1);
  t.equal(j.getCurrentIndex(), 1);
  // remove
  j.remove(2);
  t.looseEqual(j.items, [1, 2]);
  t.equal(j.getCurrentIndex(), 1);
});

test('remove while playing and shuffling, `i` < current index', function(t) {
  t.plan(8);
  var j = jockey([1, 2, 3]);
  // shuffle
  j._s = function(arr, startIndex) {
    t.looseEqual(arr, [1, 2, 3]);
    t.equal(startIndex, 0);
    arr[0] = 3;
    arr[1] = 2;
    arr[2] = 1;
  };
  j.shuffle();
  t.looseEqual(j.shuffled, [3, 2, 1]);
  t.equal(j.getCurrentIndex(), -1);
  // play
  j.play();
  t.equal(j.getCurrentIndex(), 2);
  // remove
  j.remove(1);
  t.looseEqual(j.items, [1, 3]);
  t.looseEqual(j.shuffled, [3, 1]);
  t.equal(j.getCurrentIndex(), 1);
});

test('remove while playing and shuffling, `i` == current index', function(t) {
  t.plan(11);
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
  t.equal(j.getCurrentIndex(), -1);
  // play
  j.play();
  t.equal(j.getCurrentIndex(), 1);
  // remove
  j._s = function(arr, startIndex) {
    t.looseEqual(arr, [1, 3]);
    t.equal(startIndex, 0);
    arr[0] = 3;
    arr[1] = 1;
  };
  j.remove(1);
  t.looseEqual(j.items, [1, 3]);
  t.looseEqual(j.shuffled, [3, 1]);
  t.equal(j.getCurrentIndex(), -1);
  t.false(j.isMounted());
});

test('remove while playing and shuffling, `i` > current index', function(t) {
  t.plan(8);
  var j = jockey([1, 2, 3]);
  // shuffle
  j._s = function(arr, startIndex) {
    t.looseEqual(arr, [1, 2, 3]);
    t.equal(startIndex, 0);
    arr[0] = 1;
    arr[1] = 3;
    arr[2] = 2;
  };
  j.shuffle();
  t.looseEqual(j.shuffled, [1, 3, 2]);
  t.equal(j.getCurrentIndex(), -1);
  // play
  j.play();
  t.equal(j.getCurrentIndex(), 0);
  // remove
  j.remove(1);
  t.looseEqual(j.items, [1, 3]);
  t.looseEqual(j.shuffled, [1, 3]);
  t.equal(j.getCurrentIndex(), 0);
});
