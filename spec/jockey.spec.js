/* globals describe, it, beforeEach, expect */
'use strict';

var jockey = require('..');

var songs = ['foo', 'bar', 'baz'];

var forEach = function(arr, fn) {
  var i;
  var len = arr.length;
  for (i = 0; i < len; ++i) {
    fn(arr[i], i);
  }
};

var reverse = function(arr) {
  var i;
  var len = arr.length;
  var result = [];
  for (i = len - 1; i >= 0; --i) {
    result.push(arr[i]);
  }
  return result;
};

describe('empty', function() {

  var playlist;

  beforeEach(function() {
    playlist = jockey(reverse);
    expect(playlist.isStopped()).toBe(true);
    expect(playlist.isPlaying()).toBe(false);
    expect(playlist.isPaused()).toBe(false);
    expect(playlist.isRepeating()).toBe(false);
    expect(playlist.isShuffling()).toBe(false);
    expect(playlist.get()).toEqual([]);
    expect(playlist.getPlayOrder()).toEqual([]);
    expect(playlist.getCurrentIndex()).toBe(-1);
    expect(playlist.getCurrent()).toEqual(null);
  });

  it('set invalid', function() {
    expect(playlist.set(0, 'foo')).toEqual(null);
  });

  it('get invalid', function() {
    expect(playlist.get(0)).toEqual(null);
  });

  it('add', function() {
    expect(playlist.add(songs[0])).toBe(songs[0]);
  });

  it('remove invalid index', function() {
    expect(playlist.remove(0)).toBe(null);
  });

  it('reorder invalid indices', function() {
    expect(playlist.reorder(0, 0)).toBe(null);
  });

  it('play', function() {
    expect(playlist.play()).toBe(null);
    expect(playlist.isStopped()).toBe(true);
  });

  it('play invalid index', function() {
    expect(playlist.play(0)).toBe(null);
    expect(playlist.isStopped()).toBe(true);
  });

  it('pause', function() {
    expect(playlist.pause()).toBe(null);
    expect(playlist.isStopped()).toBe(true);
  });

  it('previous', function() {
    expect(playlist.getPreviousIndex()).toBe(-1);
    expect(playlist.getPrevious()).toBe(null);
    expect(playlist.previous()).toBe(null);
    expect(playlist.isStopped()).toBe(true);
  });

  it('next', function() {
    expect(playlist.getNextIndex()).toBe(-1);
    expect(playlist.getNext()).toBe(null);
    expect(playlist.next()).toBe(null);
    expect(playlist.isStopped()).toBe(true);
  });

  it('repeat', function() {
    expect(playlist.repeat()).toBe(true);
    expect(playlist.isRepeating()).toBe(true);
  });

  it('shuffle', function() {
    expect(playlist.shuffle()).toBe(true);
    expect(playlist.isShuffling()).toBe(true);
  });

});

describe('multiple items', function() {

  var playlist;

  beforeEach(function() {
    playlist = jockey(reverse);
    forEach(songs, function(song) {
      expect(playlist.add(song)).toBe(song);
    });
    expect(playlist.isStopped()).toBe(true);
    expect(playlist.isPlaying()).toBe(false);
    expect(playlist.isPaused()).toBe(false);
    expect(playlist.isRepeating()).toBe(false);
    expect(playlist.isShuffling()).toBe(false);
    expect(playlist.get()).toEqual(songs);
    expect(playlist.getPlayOrder()).toEqual([0, 1, 2]);
    expect(playlist.getCurrentIndex()).toBe(-1);
    expect(playlist.getCurrent()).toEqual(null);
  });

  describe('play', function() {

    beforeEach(function() {
      expect(playlist.play()).toBe(songs[0]);
      expect(playlist.getPlayOrder()).toEqual([0, 1, 2]);
    });

    it('set valid', function() {
      expect(playlist.set(0, 'qux')).toBe('qux');
    });

    it('play', function() {
      expect(playlist.play()).toBe(songs[0]);
      expect(playlist.isPlaying()).toBe(true);
    });

    it('pause', function() {
      expect(playlist.pause()).toBe(songs[0]);
      expect(playlist.isPaused()).toBe(true);
    });

    describe('repeat', function() {

      beforeEach(function() {
        expect(playlist.repeat()).toBe(true);
        expect(playlist.isRepeating()).toBe(true);
      });

      it('next, next, next', function() {
        expect(playlist.next()).toBe(songs[1]);
        expect(playlist.next()).toBe(songs[2]);
        expect(playlist.next()).toBe(songs[0]);
        expect(playlist.isPlaying()).toBe(true);
      });

      it('play, previous', function() {
        expect(playlist.previous()).toBe(songs[2]);
        expect(playlist.isPlaying()).toBe(true);
      });

    });

    it('shuffle', function() {
      expect(playlist.shuffle()).toBe(true);
      expect(playlist.isShuffling()).toBe(true);
    });

  });

  describe('play valid index', function() {

    beforeEach(function() {
      expect(playlist.play(1)).toBe(songs[1]);
      expect(playlist.getPlayOrder()).toEqual([0, 1, 2]);
    });

    it('move item being played', function() {
      expect(playlist.reorder(1, 0)).toBe(songs[1]);
      expect(playlist.getCurrentIndex()).toBe(0);
      expect(playlist.getPlayOrder()).toEqual([0, 1, 2]);
      expect(playlist.isPlaying()).toBe(true);
    });

    it('move item not being played', function() {
      expect(playlist.reorder(2, 1)).toBe(songs[2]);
      expect(playlist.getCurrentIndex()).toBe(1);
      expect(playlist.getPlayOrder()).toEqual([0, 1, 2]);
      expect(playlist.isPlaying()).toBe(true);
    });

    it('previous, previous', function() {
      // previous
      expect(playlist.getPreviousIndex()).toBe(0);
      expect(playlist.getPrevious()).toBe(songs[0]);
      expect(playlist.previous()).toBe(songs[0]);
      // previous
      expect(playlist.isPlaying()).toBe(true);
      expect(playlist.previous()).toBe(null);
      expect(playlist.isStopped()).toBe(true);
    });

    it('next, next', function() {
      // next
      expect(playlist.getNextIndex()).toBe(2);
      expect(playlist.getNext()).toBe(songs[2]);
      expect(playlist.next()).toBe(songs[2]);
      // next
      expect(playlist.isPlaying()).toBe(true);
      expect(playlist.next()).toBe(null);
      expect(playlist.isStopped()).toBe(true);
    });

  });

  describe('shuffle', function() {

    beforeEach(function() {
      expect(playlist.shuffle()).toBe(true);
      expect(playlist.isShuffling()).toBe(true);
      expect(playlist.getPlayOrder()).toEqual([2, 1, 0]);
    });

    describe('play valid index', function() {

      beforeEach(function() {
        expect(playlist.play(1)).toBe(songs[1]);
        expect(playlist.getCurrentIndex()).toBe(1);
        expect(playlist.getPlayOrder()).toEqual([1, 2, 0]);
      });

      it('move item being played to the start', function() {
        expect(playlist.reorder(1, 0)).toBe(songs[1]);
        expect(playlist.getCurrentIndex()).toBe(0);
        expect(playlist.getPlayOrder()).toEqual([0, 2, 1]);
        expect(playlist.isPlaying()).toBe(true);
      });

      it('move item being played to the end', function() {
        expect(playlist.reorder(1, 2)).toBe(songs[1]);
        expect(playlist.getCurrentIndex()).toBe(2);
        expect(playlist.getPlayOrder()).toEqual([2, 1, 0]);
        expect(playlist.isPlaying()).toBe(true);
      });

    });

    it('play, add', function() {
      // play
      expect(playlist.play()).toBe(songs[2]);
      expect(playlist.getCurrentIndex()).toBe(2);
      expect(playlist.getPlayOrder()).toEqual([2, 1, 0]);
      // add
      expect(playlist.isPlaying()).toBe(true);
      expect(playlist.add('qux')).toBe('qux');
      expect(playlist.getPlayOrder()).toEqual([2, 3, 0, 1]);
    });

    it('play, unshuffle, next', function() {
      // play
      expect(playlist.play()).toBe(songs[2]);
      expect(playlist.getCurrentIndex()).toBe(2);
      // shuffle
      expect(playlist.shuffle()).toBe(false);
      expect(playlist.isShuffling()).toBe(false);
      expect(playlist.getPlayOrder()).toEqual([0, 1, 2]);
      expect(playlist.isPlaying()).toBe(true);
      expect(playlist.getCurrentIndex()).toBe(2);
      // next
      expect(playlist.next()).toBe(null);
    });

    it('play valid index, remove item being played, play', function() {
      // play valid index
      expect(playlist.play(1)).toBe(songs[1]);
      expect(playlist.getCurrentIndex()).toBe(1);
      expect(playlist.getPlayOrder()).toEqual([1, 2, 0]);
      // remove item being played
      expect(playlist.isPlaying()).toBe(true);
      expect(playlist.remove(1)).toBe(songs[1]);
      expect(playlist.getCurrentIndex()).toBe(-1);
      expect(playlist.isPlaying()).toBe(false);
      expect(playlist.getPlayOrder()).toEqual([0, 1]);
      // play
      expect(playlist.play()).toBe(songs[0]);
    });

    it('play, remove item not being played, next', function() {
      // play
      expect(playlist.play()).toBe(songs[2]);
      expect(playlist.getCurrentIndex()).toBe(2);
      expect(playlist.getPlayOrder()).toEqual([2, 1, 0]);
      // remove item not being played
      expect(playlist.isPlaying()).toBe(true);
      expect(playlist.remove(1)).toBe(songs[1]);
      expect(playlist.getCurrentIndex()).toBe(1);
      expect(playlist.isPlaying()).toBe(true);
      expect(playlist.getPlayOrder()).toEqual([1, 0]);
      // next
      expect(playlist.next()).toBe(songs[0]);
    });

    it('repeat, play, next, add, next, next, next', function() {
      // repeat
      expect(playlist.repeat()).toBe(true);
      expect(playlist.isRepeating()).toBe(true);
      // play
      expect(playlist.play()).toBe(songs[2]);
      expect(playlist.getCurrentIndex()).toBe(2);
      expect(playlist.getPlayOrder()).toEqual([2, 1, 0]);
      // next
      expect(playlist.next()).toBe(songs[1]);
      // add
      expect(playlist.add('qux')).toEqual('qux');
      expect(playlist.getPlayOrder()).toEqual([2, 1, 3, 0]);
      // next, next
      expect(playlist.next()).toBe('qux');
      expect(playlist.next()).toBe(songs[0]);
      // next
      expect(playlist.isPlaying()).toBe(true);
      expect(playlist.getCurrentIndex()).toBe(0);
      expect(playlist.getPlayOrder()).toEqual([2, 1, 3, 0]);
      expect(playlist.next()).toBe(songs[2]);
      expect(playlist.isPlaying()).toBe(true);
      expect(playlist.getCurrentIndex()).toBe(2);
      expect(playlist.getPlayOrder()).toEqual([2, 3, 1, 0]);
    });

    it('repeat, play, add', function() {
      // repeat
      expect(playlist.repeat()).toBe(true);
      expect(playlist.isRepeating()).toBe(true);
      // play
      expect(playlist.play()).toBe(songs[2]);
      expect(playlist.getCurrentIndex()).toBe(2);
      expect(playlist.getPlayOrder()).toEqual([2, 1, 0]);
      // add
      expect(playlist.add('qux')).toEqual('qux');
      expect(playlist.getPlayOrder()).toEqual([2, 3, 0, 1]);
      // previous
      expect(playlist.previous()).toBe(songs[1]);
      expect(playlist.getCurrentIndex()).toBe(1);
      expect(playlist.getPlayOrder()).toEqual([3, 2, 0, 1]);
    });

  });

});
