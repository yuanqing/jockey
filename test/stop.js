'use strict';

var test = require('tape');
var jockey = require('..');

//
// stop()
//

test('has no effect if not currently playing', function(t) {
  t.plan(4);
  var j = jockey([1, 2, 3]);
  t.equal(j.getCurrentIndex(), -1);
  t.false(j.isMounted());
  // stop
  j.stop();
  t.equal(j.getCurrentIndex(), -1);
  t.false(j.isMounted());
});

test('if playing, stops', function(t) {
  t.plan(4);
  var j = jockey([1, 2, 3]);
  // play
  j.play();
  t.equal(j.getCurrentIndex(), 0);
  t.true(j.isMounted());
  // stop
  j.stop();
  t.equal(j.getCurrentIndex(), -1);
  t.false(j.isMounted());
});

test('if playing and shuffling, stops, and reshuffles `this.shuffled`', function(t) {
  t.plan(12);
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
  t.equal(j.getCurrentIndex(), -1);
  t.false(j.isMounted());
  t.looseEqual(j.shuffled, [3, 2, 1]);
  // play
  j.play();
  t.equal(j.getCurrentIndex(), 2);
  t.true(j.isMounted());
  // stop
  j._s = function(arr, startIndex) {
    t.looseEquals(arr, [1, 2, 3]);
    t.equals(startIndex, 0);
    arr[0] = 2;
    arr[1] = 1;
    arr[2] = 3;
  };
  j.stop();
  t.equal(j.getCurrentIndex(), -1);
  t.false(j.isMounted());
  t.looseEqual(j.shuffled, [2, 1, 3]);
});
