'use strict';

var test = require('tape');
var jockey = require('..');

//
// next()
//

test('has no effect if not currently mounted', function(t) {
  t.plan(2);
  var j = jockey([1, 2, 3]);
  // next
  t.equal(j.getCurrentIndex(), -1);
  j.next();
  t.equal(j.getCurrentIndex(), -1);
});

test('plays the next track', function(t) {
  t.plan(2);
  var j = jockey([1, 2, 3]);
  // play
  j.play(1);
  t.equal(j.getCurrentIndex(), 1);
  // next
  j.next();
  t.equal(j.getCurrentIndex(), 2);
});

test('if no next item, stops playing', function(t) {
  t.plan(2);
  var j = jockey([1, 2, 3]);
  // play
  j.play(2);
  t.equal(j.getCurrentIndex(), 2);
  // next
  j.next();
  t.equal(j.getCurrentIndex(), -1);
});

test('if repeating, wraps around to the first item', function(t) {
  t.plan(3);
  var j = jockey([1, 2, 3]);
  // repeat
  j.repeat();
  t.true(j.isRepeating());
  // play
  j.play(2);
  t.equal(j.getCurrentIndex(), 2);
  // next
  j.next();
  t.equal(j.getCurrentIndex(), 0);
});

test('if shuffling, plays the next item in `this.shuffled`', function(t) {
  t.plan(5);
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
});

test('if shuffling and no next item, stops playing and reshuffles `this.shuffled`', function(t) {
  t.plan(10);
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
  // next
  j.next();
  t.equal(j.getCurrentIndex(), 1);
  // next
  j._s = function(arr, startIndex) {
    t.looseEqual(arr, [1, 2, 3]);
    t.equal(startIndex, 0);
    arr[0] = 3;
    arr[1] = 2;
    arr[2] = 1;
  };
  j.next();
  t.looseEqual(j.shuffled, [3, 2, 1]);
  t.equal(j.getCurrentIndex(), -1);
});

test('if shuffling and repeating, reshuffles `this.shuffled` and plays the first item in `this.shuffled`', function(t) {
  t.plan(11);
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
  // next
  j.next();
  t.equal(j.getCurrentIndex(), 0);
  // next
  j.next();
  t.equal(j.getCurrentIndex(), 1);
  // next
  j._s = function(arr, startIndex) {
    t.looseEqual(arr, [1, 2, 3]);
    t.equal(startIndex, 0);
    arr[0] = 3;
    arr[1] = 2;
    arr[2] = 1;
  };
  j.next();
  t.looseEqual(j.shuffled, [3, 2, 1]);
  t.equal(j.getCurrentIndex(), 2);
});

test('if shuffling and repeating, reshuffles `this.shuffled` and plays the first item in `this.shuffled`, which must be different from the currently-mounted item', function(t) {
  t.plan(11);
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
  // next
  j.next();
  t.equal(j.getCurrentIndex(), 0);
  // next
  j.next();
  t.equal(j.getCurrentIndex(), 1);
  // next
  j._s = function(arr, startIndex) {
    t.looseEqual(arr, [1, 2, 3]);
    t.equal(startIndex, 0);
    arr[0] = 2; // first item is same as the currently-mounted item
    arr[1] = 3;
    arr[2] = 1;
  };
  j.next();
  t.notEqual(j.shuffled[0], 2);
  t.notEqual(j.getCurrentIndex(), 1);
});
