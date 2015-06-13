'use strict';

var test = require('tape');
var jockey = require('..');

//
// play([i])
//

test('throws if playlist is empty', function(t) {
  t.plan(8);
  var j = jockey();
  t.equal(j.getCurrentIndex(), -1);
  t.false(j.isMounted());
  t.throws(function() {
    j.play();
  });
  t.equal(j.getCurrentIndex(), -1);
  t.false(j.isMounted());
  t.throws(function() {
    j.play(0);
  });
  t.equal(j.getCurrentIndex(), -1);
  t.false(j.isMounted());
});

test('throws for invalid `i`', function(t) {
  t.plan(8);
  var j = jockey([1, 2, 3]);
  t.equal(j.getCurrentIndex(), -1);
  t.false(j.isMounted());
  t.throws(function() {
    j.play(-1);
  });
  t.equal(j.getCurrentIndex(), -1);
  t.false(j.isMounted());
  t.throws(function() {
    j.play(3);
  });
  t.equal(j.getCurrentIndex(), -1);
  t.false(j.isMounted());
});

test('plays the item at index 0 if no `i` specified', function(t) {
  t.plan(3);
  var j = jockey([1, 2, 3]);
  j.play();
  t.equal(j.getCurrentIndex(), 0);
  t.true(j.isMounted());
  t.true(j.isPlaying());
});

test('plays the item at index `i`', function(t) {
  t.plan(3);
  var j = jockey([1, 2, 3]);
  j.play(2);
  t.equal(j.getCurrentIndex(), 2);
  t.true(j.isMounted());
  t.true(j.isPlaying());
});

test('if shuffling and no `i` specified, plays the item at index 0 of `this.shuffled`', function(t) {
  t.plan(6);
  var j = jockey([1, 2, 3]);
  // shuffle
  j._s = function(arr, startIndex) {
    t.looseEquals(arr, [1, 2, 3]);
    t.equals(startIndex, 0);
    arr[0] = 2;
    arr[1] = 1;
    arr[2] = 3;
  };
  j.shuffle();
  t.looseEqual(j.shuffled, [2, 1, 3]);
  // play
  j.play();
  t.equal(j.getCurrentIndex(), 1);
  t.true(j.isMounted());
  t.true(j.isPlaying());
});

test('if shuffling, plays the item at index `i` of `this.item` and reshuffles the "unplayed" subarray of `this.shuffled`', function(t) {
  t.plan(9);
  var j = jockey([1, 2, 3]);
  // shuffle
  j._s = function(arr, startIndex) {
    t.looseEquals(arr, [1, 2, 3]);
    t.equals(startIndex, 0);
    arr[0] = 3;
    arr[1] = 2;
    arr[2] = 1;
  };
  j.shuffle();
  t.looseEqual(j.shuffled, [3, 2, 1]);
  // play
  j._s = function(arr, startIndex) {
    t.looseEquals(arr, [2, 1, 3]);
    t.equals(startIndex, 1);
    arr[0] = 2;
    arr[1] = 3;
    arr[2] = 1;
  };
  j.play(1);
  t.equal(j.getCurrentIndex(), 1);
  t.true(j.isMounted());
  t.true(j.isPlaying());
  t.looseEqual(j.shuffled, [2, 3, 1]);
});

test('if no `i`, pauses if currently playing', function(t) {
  t.plan(8);
  var j = jockey([1, 2, 3]);
  j.play();
  t.equal(j.getCurrentIndex(), 0);
  t.true(j.isMounted());
  t.true(j.isPlaying());
  t.false(j.isPaused());
  j.play();
  t.equal(j.getCurrentIndex(), 0);
  t.true(j.isMounted());
  t.false(j.isPlaying());
  t.true(j.isPaused());
});

test('if no `i`, resumes if currently paused', function(t) {
  t.plan(8);
  var j = jockey([1, 2, 3]);
  j.play();
  j.play();
  t.equal(j.getCurrentIndex(), 0);
  t.true(j.isMounted());
  t.false(j.isPlaying());
  t.true(j.isPaused());
  j.play();
  t.equal(j.getCurrentIndex(), 0);
  t.true(j.isMounted());
  t.true(j.isPlaying());
  t.false(j.isPaused());
});
