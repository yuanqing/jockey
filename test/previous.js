'use strict';

var test = require('tape');
var jockey = require('..');

//
// previous()
//

test('has no effect if not currently mounted', function(t) {
  t.plan(2);
  var j = jockey([1, 2, 3]);
  // previous
  t.equal(j.getCurrentIndex(), -1);
  j.previous();
  t.equal(j.getCurrentIndex(), -1);
});

test('plays the previous track', function(t) {
  t.plan(2);
  var j = jockey([1, 2, 3]);
  // play
  j.play(1);
  t.equal(j.getCurrentIndex(), 1);
  // previous
  j.previous();
  t.equal(j.getCurrentIndex(), 0);
});

test('if no previous item, stops playing', function(t) {
  t.plan(2);
  var j = jockey([1, 2, 3]);
  // play
  j.play(0);
  t.equal(j.getCurrentIndex(), 0);
  // previous
  j.previous();
  t.equal(j.getCurrentIndex(), -1);
});

test('if repeating, wraps around to the last item', function(t) {
  t.plan(3);
  var j = jockey([1, 2, 3]);
  // repeat
  j.repeat();
  t.true(j.isRepeating());
  // play
  j.play(0);
  t.equal(j.getCurrentIndex(), 0);
  // previous
  j.previous();
  t.equal(j.getCurrentIndex(), 2);
});

test('if shuffling, plays the previous item in `this.shuffled`', function(t) {
  t.plan(7);
  var j = jockey([1, 2, 3]);
  // shuffle
  j._s = function(arr, startIndex) {
    t.looseEqual(arr, [1, 2, 3]);
    t.equal(startIndex, 0);
    arr[0] = 3;
    arr[1] = 1;
    arr[2] = 2;
  };
  j.shuffle();
  t.looseEqual(j.shuffled, [3, 1, 2]);
  // play
  j.play();
  t.equal(j.getCurrentIndex(), 2);
  // next
  j.next();
  t.equal(j.getCurrentIndex(), 0);
  // previous
  j.previous();
  t.equal(j.getCurrentIndex(), 2);
  t.looseEqual(j.shuffled, [3, 1, 2]);
});

test('if shuffling and no previous item, stops playing and reshuffles `this.shuffled`', function(t) {
  t.plan(8);
  var j = jockey([1, 2, 3]);
  // shuffle
  j._s = function(arr, startIndex) {
    t.looseEqual(arr, [1, 2, 3]);
    t.equal(startIndex, 0);
    arr[0] = 3;
    arr[1] = 1;
    arr[2] = 2;
  };
  j.shuffle();
  t.looseEqual(j.shuffled, [3, 1, 2]);
  // play
  j.play();
  t.equal(j.getCurrentIndex(), 2);
  // previous
  j._s = function(arr, startIndex) {
    t.looseEqual(arr, [1, 2, 3]);
    t.equal(startIndex, 0);
    arr[0] = 3;
    arr[1] = 2;
    arr[2] = 1;
  };
  j.previous();
  t.looseEqual(j.shuffled, [3, 2, 1]);
  t.equal(j.getCurrentIndex(), -1);
});

test('if shuffling and repeating, reshuffles `this.shuffled` and plays the last item in `this.shuffled`', function(t) {
  t.plan(10);
  var j = jockey([1, 2, 3]);
  // repeat
  j.repeat();
  t.true(j.isRepeating());
  // shuffle
  j._s = function(arr, startIndex) {
    t.looseEqual(arr, [1, 2, 3]);
    t.equal(startIndex, 0);
    arr[0] = 3;
    arr[1] = 1;
    arr[2] = 2;
  };
  j.shuffle();
  t.looseEqual(j.shuffled, [3, 1, 2]);
  // play
  j.play();
  t.equal(j.getCurrentIndex(), 2);
  // previous
  j._s = function(arr, startIndex) {
    t.looseEqual(arr, [1, 2, 3]);
    t.equal(startIndex, 0);
    arr[0] = 2;
    arr[1] = 3;
    arr[2] = 1;
  };
  j.previous();
  t.looseEqual(j.shuffled, [2, 3, 1]);
  t.equal(j.getCurrentIndex(), 0);
  // previous
  j.previous();
  t.equal(j.getCurrentIndex(), 2);
});

test('if shuffling and repeating, reshuffles `this.shuffled` and plays the last item in `this.shuffled`, which must be different from the currently-mounted item', function(t) {
  t.plan(9);
  var j = jockey([1, 2, 3]);
  // repeat
  j.repeat();
  t.true(j.isRepeating());
  // shuffle
  j._s = function(arr, startIndex) {
    t.looseEqual(arr, [1, 2, 3]);
    t.equal(startIndex, 0);
    arr[0] = 3;
    arr[1] = 1;
    arr[2] = 2;
  };
  j.shuffle();
  t.looseEqual(j.shuffled, [3, 1, 2]);
  // play
  j.play();
  t.equal(j.getCurrentIndex(), 2);
  // previous
  j._s = function(arr, startIndex) {
    t.looseEqual(arr, [1, 2, 3]);
    t.equal(startIndex, 0);
    arr[0] = 1;
    arr[1] = 2;
    arr[2] = 3; // last item is same as the currently-mounted item
  };
  j.previous();
  t.notEqual(j.shuffled[2], 3);
  t.notEqual(j.getCurrentIndex(), 2);
});
