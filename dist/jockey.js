require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"jockey":[function(require,module,exports){
'use strict';

var STOPPED = 0;
var PLAYING = 1;
var PAUSED = 2;

var noop = function() {};

var forEach = function(arr, fn) {
  var i;
  var len = arr.length;
  for (i = 0; i < len; ++i) {
    fn(arr[i], i);
  }
};

var jockey = function(items, cbs, mockShuffle) {

  items = items ? items.slice() : [];

  cbs = cbs || {};
  forEach(['onModelChange', 'onStateChange'], function(name) {
    cbs[name] = cbs[name] || noop;
  });

  var playOrder = [];
  forEach(items, function(_, i) {
    playOrder.push(i);
  });

  var playOrderIndex = -1;
  var state = STOPPED;
  var repeating = false;
  var shuffling = false;

  var _isValidIndex = function(index) {
    return index > -1 && items.length > index;
  };

  var _getNextPlayOrderIndex = function() {

    // exit if not playing
    if (state === STOPPED) {
      return -1;
    }

    // increment
    var nextIndex = playOrderIndex + 1;

    // wraparound if repeating
    if (nextIndex === playOrder.length && repeating) {
      nextIndex = 0;
    }

    // return `nextIndex` if valid, else return -1
    if (nextIndex < playOrder.length) {
      return nextIndex;
    }
    return -1;

  };

  var _getPreviousPlayOrderIndex = function() {

    // exit if not playing
    if (state === STOPPED) {
      return -1;
    }

    // decrement
    var previousIndex = playOrderIndex - 1;

    // wraparound if repeating
    if (previousIndex === -1 && repeating) {
      previousIndex = playOrder.length - 1;
    }

    // return `previousIndex` if valid, else return -1
    if (previousIndex > -1) {
      return previousIndex;
    }
    return -1;

  };

  var _stop = function(self) {
    playOrderIndex = -1;
    state = STOPPED;
    cbs.onStateChange('stopped', self.getCurrent());
    if (shuffling) {
      playOrder = _shuffle(playOrder);
    }
    return null;
  };

  var _playByPlayOrderIndex = function(self, _playOrderIndex) {

    if (_isValidIndex(_playOrderIndex)) {
      playOrderIndex = _playOrderIndex;
      state = PLAYING;
      cbs.onStateChange('playing', self.getCurrent());
      return items[playOrder[playOrderIndex]];
    }
    return _stop(self);

  };

  /* istanbul ignore next */
  var _shuffle = mockShuffle || function(arr) {

    var i = arr.length - 1;
    var j, temp;
    while (i > 0) {
      j = Math.floor(Math.random() * (i + 1));
      temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
      i--;
    }
    return arr;

  };

  var _spliceToFront = function(itemIndex) {
    playOrder.sort();
    playOrder.splice(itemIndex, 1);
    playOrder = [itemIndex].concat(_shuffle(playOrder));
  };

  var _spliceToEnd = function(itemIndex) {
    playOrder.sort();
    playOrder.splice(itemIndex, 1);
    playOrder = _shuffle(playOrder).concat([itemIndex]);
  };

  var _get = function(index) {

    if (typeof index === 'undefined') {
      return items;
    }
    if (index > -1 && index < items.length) {
      return items[index];
    }
    return null;

  };

  return {

    add: function(item) {

      items.push(item);
      playOrder.push(items.length - 1);

      // call `onModelChange` callback
      cbs.onModelChange(_get());

      if (this.isShuffling()) {
        // shuffle unplayed items in `playOrder`
        var unplayedIndices = playOrder.splice(playOrderIndex + 1);
        playOrder = playOrder.concat(_shuffle(unplayedIndices));
      }

      return item;

    },

    remove: function(itemIndex) {

      if (!_isValidIndex(itemIndex)) {
        return null;
      }

      // remove the item at `itemIndex`
      var removedItem = items.splice(itemIndex, 1)[0];

      // call `onModelChange` callback
      cbs.onModelChange(_get());

      // stop if `removedItem` is currently played or paused
      if (itemIndex === playOrder[playOrderIndex]) {
        this.stop();
      }

      // remove `itemIndex` from `playOrder`, and move indices > `itemIndex`
      // left by 1
      var newPlayOrder = [];
      forEach(playOrder, function(playOrderIndex) {
        if (playOrderIndex !== itemIndex) {
          if (playOrderIndex > itemIndex) {
            playOrderIndex = playOrderIndex - 1;
          }
          newPlayOrder.push(playOrderIndex);
        }
      });
      playOrder = newPlayOrder;
      if (playOrderIndex > itemIndex) {
        playOrderIndex = playOrderIndex - 1;
      }

      return removedItem;

    },

    set: function(index, newItem) {

      if (index > -1 && index < items.length) {

        // call `onModelChange` callback
        cbs.onModelChange(_get());

        items[index] = newItem;
        return newItem;
      }

      return null;

    },

    get: _get,

    getCurrentIndex: function() {

      if (playOrderIndex === -1) {
        return -1;
      }
      return playOrder[playOrderIndex];

    },

    getCurrent: function() {

      return this.get(this.getCurrentIndex());

    },

    getPlayOrder: function() {

      return playOrder;

    },

    reorder: function(oldIndex, newIndex) {

      // exit if no change, or invalid indices
      if (oldIndex === newIndex || !_isValidIndex(oldIndex) || !_isValidIndex(newIndex)) {
        return null;
      }

      // move item from `oldIndex` to `newIndex`
      var movedItem = items.splice(oldIndex, 1)[0];
      items.splice(newIndex, 0, movedItem);

      // call `onModelChange` callback
      cbs.onModelChange(this.get());

      if (this.isShuffling()) {
        // find left and right ordering of `oldIndex` and `newIndex`
        var l, r, offset;
        if (oldIndex < newIndex) {
          l = oldIndex;
          r = newIndex;
          offset = -1;
        } else {
          l = newIndex;
          r = oldIndex;
          offset = 1;
        }
        // adjust `playOrder` if shuffling
        forEach(playOrder, function(playOrderIndex, i) {
          if (playOrderIndex >= l && playOrderIndex <= r) {
            if (playOrderIndex === oldIndex) {
              playOrder[i] = newIndex;
            } else {
              playOrder[i] = playOrderIndex + offset;
            }
          }
        });
      } else {
        // adjust `playOrderIndex` if not shuffling
        if (playOrderIndex === oldIndex) {
          playOrderIndex = newIndex;
        } else {
          if (playOrderIndex >= newIndex && playOrderIndex < oldIndex) {
            playOrderIndex = playOrderIndex + 1;
          }
          if (playOrderIndex <= newIndex && playOrderIndex > oldIndex) {
            playOrderIndex = playOrderIndex - 1;
          }
        }
      }

      return items[newIndex];

    },

    isStopped: function() {
      return state === STOPPED;
    },
    isPlaying: function() {
      return state === PLAYING;
    },
    isPaused: function() {
      return state === PAUSED;
    },
    isRepeating: function() {
      return repeating;
    },
    isShuffling: function() {
      return shuffling;
    },

    stop: function() {

      return _stop(this);

    },

    play: function(itemIndex) {

      var currentItem;

      if (typeof itemIndex === 'undefined') {
        if (this.isStopped()) {
          itemIndex = playOrder[0];
        } else {
          itemIndex = playOrder[playOrderIndex];
        }
        if (_isValidIndex(itemIndex)) {
          if (this.isStopped()) {
            playOrderIndex = 0; // playOrder 0 was valid; save it
          }
          state = PLAYING;
          currentItem = this.getCurrent();
          cbs.onStateChange('playing', currentItem);
          return currentItem;
        }
      } else {
        if (_isValidIndex(itemIndex)) {
          if (this.isShuffling()) {
            // move `itemIndex` to the front of `playOrder`
            _spliceToFront(itemIndex);
            playOrderIndex = 0;
          } else {
            playOrderIndex = itemIndex;
          }
          state = PLAYING;
          currentItem = this.getCurrent();
          cbs.onStateChange('playing', currentItem);
          return currentItem;
        }
      }

      this.stop();
      return null;

    },

    pause: function() {

      if (!this.isStopped()) {
        state = PAUSED;
        var currentItem = this.getCurrent();
        cbs.onStateChange('paused', this.getCurrent());
        return currentItem;
      }

      return null;

    },

    getPreviousIndex: function() {

      var playOrderIndex = _getPreviousPlayOrderIndex();
      if (_isValidIndex(playOrderIndex)) {
        return playOrder[playOrderIndex];
      }
      return -1;

    },

    getPrevious: function() {

      var itemIndex = this.getPreviousIndex();
      return this.get(itemIndex);

    },

    previous: function() {

      var playOrderIndex = _getPreviousPlayOrderIndex();

      if (this.isRepeating() && playOrderIndex === playOrder.length - 1) {
        var itemIndex = playOrder[playOrderIndex];
        _spliceToEnd(itemIndex);
      }

      return _playByPlayOrderIndex(this, playOrderIndex);

    },

    getNextIndex: function() {

      var playOrderIndex = _getNextPlayOrderIndex();
      if (_isValidIndex(playOrderIndex)) {
        return playOrder[playOrderIndex];
      }
      return -1;

    },

    getNext: function() {

      var itemIndex = this.getNextIndex();
      return this.get(itemIndex);

    },

    next: function() {

      var playOrderIndex = _getNextPlayOrderIndex();

      if (this.isRepeating() && playOrderIndex === 0) {
        var itemIndex = playOrder[playOrderIndex];
        _spliceToFront(itemIndex);
      }

      return _playByPlayOrderIndex(this, playOrderIndex);

    },

    repeat: function() {

      repeating = !repeating;
      return repeating;

    },

    shuffle: function() {

      if (this.isShuffling()) {
        playOrderIndex = playOrder[playOrderIndex];
        shuffling = false;
        playOrder.sort();
        return false;
      }

      shuffling = true;
      if (this.isStopped()) {
        // shuffle entire `playOrder`
        playOrder = _shuffle(playOrder);
      } else {
        // move `playOrderIndex` to front
        _spliceToFront(playOrderIndex);
        playOrderIndex = 0;
      }
      return true;

    }

  };

};

module.exports = exports = jockey;

},{}]},{},[]);
