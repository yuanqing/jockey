'use strict';

var test = require('tape');
var jockey = require('..');

//
// reorder(oldIndex, newIndex)
//

test('invalid `oldIndex`', function(t) {
  t.plan(1);
  var j = jockey([1, 2, 3]);
  t.throws(function() {
    j.reorder(3, 1);
  });
});

test('invalid `newIndex`', function(t) {
  t.plan(1);
  var j = jockey([1, 2, 3]);
  t.throws(function() {
    j.reorder(1, -1);
  });
});

test('`oldIndex` == `newIndex`', function(t) {
  t.test('not playing', function(t) {
    t.plan(1);
    var j = jockey([1, 2, 3]);
    j.reorder(1, 1);
    t.looseEqual(j.items, [1, 2, 3]);
  });
  t.test('current index == `oldIndex` == `newIndex`', function(t) {
    t.plan(5);
    var j = jockey([1, 2, 'x', 3, 4]);
    j.play(2);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 2);
    j.reorder(2, 2);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 2);
    t.looseEqual(j.items, [1, 2, 'x', 3, 4]);
  });
  t.test('current index < `oldIndex` == `newIndex`', function(t) {
    t.plan(5);
    var j = jockey([1, 2, 'x', 3, 4]);
    j.play(2);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 2);
    j.reorder(3, 3);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 2);
    t.looseEqual(j.items, [1, 2, 'x', 3, 4]);
  });
  t.test('current index > `oldIndex` == `newIndex`', function(t) {
    t.plan(5);
    var j = jockey([1, 2, 'x', 3, 4]);
    j.play(2);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 2);
    j.reorder(0, 0);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 2);
    t.looseEqual(j.items, [1, 2, 'x', 3, 4]);
  });
});

test('`oldIndex` < `newIndex`', function(t) {
  t.test('not playing', function(t) {
    t.plan(1);
    var j = jockey([1, 2, 3]);
    j.reorder(1, 2);
    t.looseEqual(j.items, [1, 3, 2]);
  });
  t.test('current index < `oldIndex` < `newIndex`', function(t) {
    t.plan(5);
    var j = jockey(['x', 1, 2, 3, 4]);
    j.play(0);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 0);
    j.reorder(2, 4);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 0);
    t.looseEqual(j.items, ['x', 1, 3, 4, 2]);
  });
  t.test('current index == `oldIndex` < `newIndex`', function(t) {
    t.plan(5);
    var j = jockey([1, 2, 'x', 3, 4]);
    j.play(2);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 2);
    j.reorder(2, 4);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 4);
    t.looseEqual(j.items, [1, 2, 3, 4, 'x']);
  });
  t.test('`oldIndex` < current index < `newIndex`', function(t) {
    t.plan(5);
    var j = jockey([1, 2, 'x', 3, 4]);
    j.play(2);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 2);
    j.reorder(1, 4);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 1);
    t.looseEqual(j.items, [1, 'x', 3, 4, 2]);
  });
  t.test('`oldIndex` < `newIndex` == current index', function(t) {
    t.plan(5);
    var j = jockey([1, 2, 3, 'x', 4]);
    j.play(3);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 3);
    j.reorder(2, 3);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 2);
    t.looseEqual(j.items, [1, 2, 'x', 3, 4]);
  });
  t.test('`oldIndex` < `newIndex` < current index', function(t) {
    t.plan(5);
    var j = jockey([1, 2, 3, 'x', 4]);
    j.play(3);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 3);
    j.reorder(0, 2);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 3);
    t.looseEqual(j.items, [2, 3, 1, 'x', 4]);
  });
});

test('`oldIndex` > `newIndex`', function(t) {
  t.test('not playing', function(t) {
    t.plan(1);
    var j = jockey([1, 2, 3]);
    j.reorder(1, 0);
    t.looseEqual(j.items, [2, 1, 3]);
  });
  t.test('current index > `oldIndex` > `newIndex`', function(t) {
    t.plan(5);
    var j = jockey([1, 2, 3, 'x', 4]);
    j.play(3);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 3);
    j.reorder(2, 1);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 3);
    t.looseEqual(j.items, [1, 3, 2, 'x', 4]);
  });
  t.test('current index == `oldIndex` > `newIndex`', function(t) {
    t.plan(5);
    var j = jockey([1, 2, 3, 'x', 4]);
    j.play(3);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 3);
    j.reorder(3, 1);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 1);
    t.looseEqual(j.items, [1, 'x', 2, 3, 4]);
  });
  t.test('`oldIndex` > current index > `newIndex`', function(t) {
    t.plan(5);
    var j = jockey([1, 2, 'x', 3, 4]);
    j.play(2);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 2);
    j.reorder(4, 1);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 3);
    t.looseEqual(j.items, [1, 4, 2, 'x', 3]);
  });
  t.test('`oldIndex` > `newIndex` == current index', function(t) {
    t.plan(5);
    var j = jockey([1, 'x', 2, 3, 4]);
    j.play(1);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 1);
    j.reorder(3, 1);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 2);
    t.looseEqual(j.items, [1, 3, 'x', 2, 4]);
  });
  t.test('`oldIndex` > `newIndex` > current index', function(t) {
    t.plan(5);
    var j = jockey(['x', 1, 2, 3, 4]);
    j.play(0);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 0);
    j.reorder(4, 1);
    t.true(j.isPlaying());
    t.equal(j.getCurrentIndex(), 0);
    t.looseEqual(j.items, ['x', 4, 1, 2, 3]);
  });
});
