'use strict';

var test = require('tape');
var jockey = require('..');

// var j = jockey([items])

test('constructor is a function', function(t) {
  t.plan(1);
  t.true(typeof jockey === 'function');
});

test('constructor can be called without the `new` keyword', function(t) {
  t.plan(1);
  var j = jockey();
  t.true(typeof j === 'object');
});

test('constructor takes an array of `items`', function(t) {
  t.plan(1);
  var items = [1, 2, 3];
  var j = jockey(items);
  t.equal(j.items, items);
});

// j.add(item)

test('throws if no `item`', function(t) {
  t.plan(2);
  var j = jockey();
  t.throws(function() {
    j.add();
  });
  t.looseEqual(j.items, []);
});

test('append item to end', function(t) {
  t.plan(1);
  var j = jockey();
  j.add(1);
  j.add(2);
  j.add(3);
  t.looseEqual(j.items, [1, 2, 3]);
});

// j.insert(item, i)

test('throws if no `item`', function(t) {
  t.plan(2);
  var j = jockey([1, 2, 3]);
  t.throws(function() {
    j.insert();
  });
  t.looseEqual(j.items, [1, 2, 3]);
});

test('throws for invalid `i`', function(t) {
  t.plan(4);
  var j = jockey([1, 2, 3]);
  t.throws(function() {
    j.insert('x', -1);
  });
  t.looseEqual(j.items, [1, 2, 3]);
  t.throws(function() {
    j.insert('x', 4);
  });
  t.looseEqual(j.items, [1, 2, 3]);
});

test('insert to start', function(t) {
  t.plan(1);
  var j = jockey([1, 2, 3]);
  j.insert('x', 0);
  t.looseEqual(j.items, ['x', 1, 2, 3]);
});

test('insert to middle', function(t) {
  t.plan(1);
  var j = jockey([1, 2, 3]);
  j.insert('x', 2);
  t.looseEqual(j.items, [1, 2, 'x', 3]);
});

test('insert to end', function(t) {
  t.plan(1);
  var j = jockey([1, 2, 3]);
  j.insert('x', 3);
  t.looseEqual(j.items, [1, 2, 3, 'x']);
});

// j.remove(i)

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

// j.size()

test('get the playlist size', function(t) {
  t.plan(1);
  var j = jockey([1, 2, 3]);
  t.equal(j.size(), 3);
});

// j.get(i)

test('throws for invalid `i`', function(t) {
  t.plan(2);
  var j = jockey([1, 2, 3]);
  t.throws(function() {
    j.get(-1);
  });
  t.throws(function() {
    j.get(3);
  });
});

test('get the item at index `i`', function(t) {
  t.plan(3);
  var j = jockey([1, 2, 3]);
  t.equal(j.get(0), 1);
  t.equal(j.get(1), 2);
  t.equal(j.get(2), 3);
});

// j.getCurrentIndex()

test('returns -1 if not currently playing', function(t) {
  t.plan(1);
  var j = jockey([1, 2, 3]);
  t.equal(j.getCurrentIndex(), -1);
});

test('get the index of the currently-playing item', function(t) {
  t.plan(2);
  var j = jockey([1, 2, 3]);
  t.equal(j.getCurrentIndex(), -1);
  j.play();
  t.equal(j.getCurrentIndex(), 0);
});

// j.getCurrent()

test('returns `null` if not currently playing', function(t) {
  t.plan(1);
  var j = jockey([1, 2, 3]);
  t.equal(j.getCurrent(), null);
});

test('get the currently-playing item', function(t) {
  t.plan(1);
  var j = jockey([1, 2, 3]);
  j.play();
  t.equal(j.getCurrent(), 1);
});

// play([i])

test('throws if playlist is empty', function(t) {
  t.plan(8);
  var j = jockey();
  t.false(j.isPlaying());
  t.equal(j.getCurrentIndex(), -1);
  t.throws(function() {
    j.play();
  });
  t.false(j.isPlaying());
  t.equal(j.getCurrentIndex(), -1);
  t.throws(function() {
    j.play(0);
  });
  t.false(j.isPlaying());
  t.equal(j.getCurrentIndex(), -1);
});

test('throws for invalid `i`', function(t) {
  t.plan(8);
  var j = jockey([1, 2, 3]);
  t.false(j.isPlaying());
  t.equal(j.getCurrentIndex(), -1);
  t.throws(function() {
    j.play(-1);
  });
  t.false(j.isPlaying());
  t.equal(j.getCurrentIndex(), -1);
  t.throws(function() {
    j.play(3);
  });
  t.false(j.isPlaying());
  t.equal(j.getCurrentIndex(), -1);
});

test('plays the item at index 0 if no `i` specified', function(t) {
  t.plan(4);
  var j = jockey([1, 2, 3]);
  t.false(j.isPlaying());
  t.equal(j.getCurrentIndex(), -1);
  j.play();
  t.true(j.isPlaying());
  t.equal(j.getCurrentIndex(), 0);
});

test('plays the item at index `i`', function(t) {
  t.plan(6);
  var j = jockey([1, 2, 3]);
  t.false(j.isPlaying());
  t.equal(j.getCurrentIndex(), -1);
  j.play(2);
  t.true(j.isPlaying());
  t.equal(j.getCurrentIndex(), 2);
  j.play();
  t.true(j.isPlaying());
  t.equal(j.getCurrentIndex(), 0);
});

// j.stop()

test('has no effect if not currently playing', function(t) {
  t.plan(2);
  var j = jockey([1, 2, 3]);
  t.false(j.isPlaying());
  j.stop();
  t.false(j.isPlaying());
});

test('stops the playlist if currently playing', function(t) {
  t.plan(6);
  var j = jockey([1, 2, 3]);
  t.false(j.isPlaying());
  t.equal(j.getCurrentIndex(), -1);
  j.play();
  t.true(j.isPlaying());
  t.equal(j.getCurrentIndex(), 0);
  j.stop();
  t.false(j.isPlaying());
  t.equal(j.getCurrentIndex(), -1);
});

// j.toggleRepeat(), j.isRepeating()

test('repeat', function(t) {
  t.plan(5);
  var j = jockey([1, 2, 3]);
  t.false(j.isRepeating());
  j.toggleRepeat();
  j.play();
  j.next();
  j.next();
  t.true(j.isPlaying());
  t.equal(j.getCurrentIndex(), 2);
  j.next();
  t.true(j.isPlaying());
  t.equal(j.getCurrentIndex(), 0);
});

// j.previous()

test('has no effect if not currently playing', function(t) {
  t.plan(2);
  var j = jockey([1, 2, 3]);
  t.false(j.isPlaying());
  j.previous();
  t.false(j.isPlaying());
});

test('plays the previous track', function(t) {
  t.plan(4);
  var j = jockey([1, 2, 3]);
  j.play(1);
  t.true(j.isPlaying());
  t.equal(j.getCurrentIndex(), 1);
  j.previous();
  t.true(j.isPlaying());
  t.equal(j.getCurrentIndex(), 0);
});

test('stops playing if not repeating and no previous item', function(t) {
  t.plan(4);
  var j = jockey([1, 2, 3]);
  j.play(0);
  t.true(j.isPlaying());
  t.equal(j.getCurrentIndex(), 0);
  j.previous();
  t.false(j.isPlaying());
  t.equal(j.getCurrentIndex(), -1);
});

test('wraps around to the last item if repeating', function(t) {
  t.plan(5);
  var j = jockey([1, 2, 3]);
  j.toggleRepeat();
  t.true(j.isRepeating());
  j.play(0);
  t.true(j.isPlaying());
  t.equal(j.getCurrentIndex(), 0);
  j.previous();
  t.true(j.isPlaying());
  t.equal(j.getCurrentIndex(), 2);
});

// j.next()

test('has no effect if not currently playing', function(t) {
  t.plan(2);
  var j = jockey([1, 2, 3]);
  t.false(j.isPlaying());
  j.next();
  t.false(j.isPlaying());
});

test('plays the next track', function(t) {
  t.plan(4);
  var j = jockey([1, 2, 3]);
  j.play(0);
  t.true(j.isPlaying());
  t.equal(j.getCurrentIndex(), 0);
  j.next();
  t.true(j.isPlaying());
  t.equal(j.getCurrentIndex(), 1);
});

test('stops playing if not repeating and no next item', function(t) {
  t.plan(4);
  var j = jockey([1, 2, 3]);
  j.play(2);
  t.true(j.isPlaying());
  t.equal(j.getCurrentIndex(), 2);
  j.next();
  t.false(j.isPlaying());
  t.equal(j.getCurrentIndex(), -1);
});

test('wraps around to the first item if repeating', function(t) {
  t.plan(5);
  var j = jockey([1, 2, 3]);
  j.toggleRepeat();
  t.true(j.isRepeating());
  j.play(2);
  t.true(j.isPlaying());
  t.equal(j.getCurrentIndex(), 2);
  j.next();
  t.true(j.isPlaying());
  t.equal(j.getCurrentIndex(), 0);
});
