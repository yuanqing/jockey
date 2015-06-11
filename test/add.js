'use strict';

var test = require('tape');
var jockey = require('..');

//
// add(item)
//

test('throws if no `item`', function(t) {
  t.plan(2);
  var j = jockey();
  t.throws(function() {
    j.add();
  });
  t.looseEqual(j.items, []);
});

test('appends `item` to the end of the playlist', function(t) {
  t.plan(2);
  var j = jockey();
  // add
  j.add(1);
  t.looseEqual(j.items, [1]);
  // add
  j.add(2);
  t.looseEqual(j.items, [1, 2]);
});

test('if shuffling, also appends `item` to the end of `this.shuffled`', function(t) {
  t.plan(6);
  var j = jockey();
  // shuffle
  j.shuffle();
  // add
  j.add(1);
  t.looseEqual(j.items, [1]);
  t.looseEqual(j.shuffled, [1]);
  // add
  j._s = function(arr, startIndex) {
    t.looseEquals(arr, [1, 2]);
    t.equals(startIndex, 0);
    arr[0] = 2;
    arr[1] = 1;
  };
  j.add(2);
  t.looseEqual(j.items, [1, 2]);
  t.looseEqual(j.shuffled, [2, 1]);
});

test('if shuffling and playing, reshuffles the "unplayed" subarray of `this.shuffled`', function(t) {
  t.plan(9);
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
  // play
  j.play();
  t.equal(j.getCurrentIndex(), 1);
  // add
  j._s = function(arr, startIndex) {
    t.looseEqual(arr, [2, 3, 1, 4]);
    t.equal(startIndex, 1);
    arr[0] = 2;
    arr[1] = 4;
    arr[2] = 3;
    arr[3] = 1;
  };
  j.add(4);
  t.looseEqual(j.items, [1, 2, 3, 4]);
  t.looseEqual(j.shuffled, [2, 4, 3, 1]);
  t.equal(j.getCurrentIndex(), 1);
});
