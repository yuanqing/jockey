'use strict';

var test = require('tape');
var jockey = require('..');

//
// shuffle()
//

test('shuffle while not mounted', function(t) {
  t.plan(3);
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
});

test('shuffle while mounted', function(t) {
  t.plan(5);
  var j = jockey([1, 2, 3]);
  // play
  j.play(1);
  t.looseEqual(j.getCurrentIndex(), 1);
  // shuffle
  j._s = function(arr, startIndex) {
    t.looseEqual(arr, [2, 1, 3]);
    t.equal(startIndex, 1);
    arr[0] = 2;
    arr[1] = 3;
    arr[2] = 1;
  };
  j.shuffle();
  t.looseEqual(j.shuffled, [2, 3, 1]);
  t.looseEqual(j.getCurrentIndex(), 1);
});

test('turns off shuffling while not mounted', function(t) {
  t.plan(6);
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
  t.looseEqual(j.getCurrentIndex(), -1);
  // shuffle
  j.shuffle();
  t.looseEqual(j.shuffled, false);
  t.looseEqual(j.getCurrentIndex(), -1);
});

test('turns off shuffling while mounted', function(t) {
  t.plan(7);
  var j = jockey([1, 2, 3]);
  // play
  j.play(1);
  t.looseEqual(j.getCurrentIndex(), 1);
  // shuffle
  j._s = function(arr, startIndex) {
    t.looseEqual(arr, [2, 1, 3]);
    t.equal(startIndex, 1);
    arr[0] = 2;
    arr[1] = 3;
    arr[2] = 1;
  };
  j.shuffle();
  t.looseEqual(j.shuffled, [2, 3, 1]);
  t.looseEqual(j.getCurrentIndex(), 1);
  // shuffle
  j.shuffle();
  t.looseEqual(j.shuffled, false);
  t.looseEqual(j.getCurrentIndex(), 1);
});
