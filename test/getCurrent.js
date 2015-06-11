'use strict';

var test = require('tape');
var jockey = require('..');

//
// getCurrent()
//

test('returns `null` if not currently playing', function(t) {
  t.plan(1);
  var j = jockey([1, 2, 3]);
  t.equal(j.getCurrent(), null);
});

test('get the currently-playing item', function(t) {
  t.plan(1);
  var j = jockey([1, 2, 3]);
  // play
  j.play();
  t.equal(j.getCurrent(), 1);
});

test('get the currently-playing item when shuffling', function(t) {
  t.plan(4);
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
  // play
  j.play();
  t.looseEqual(j.shuffled, [2, 1, 3]);
  t.equal(j.getCurrent(), 2);
});
