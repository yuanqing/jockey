'use strict';

var STOPPED = 0;
var PLAYING = 1;
var PAUSED = 2;

var jockey = function(mockShuffle) {

  var items = [];
  var playOrder = [];
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

  var _stop = function() {
    playOrderIndex = -1;
    state = STOPPED;
    if (shuffling) {
      playOrder = _shuffle(playOrder);
    }
    return null;
  };

  var _play = function(_playOrderIndex) {

    if (_isValidIndex(_playOrderIndex)) {
      playOrderIndex = _playOrderIndex;
      state = PLAYING;
      return items[playOrder[playOrderIndex]];
    }
    return _stop();

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

  return {

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

    get: function(index) {

      if (typeof index === 'undefined') {
        return items;
      }
      if (index > -1 && index < items.length) {
        return items[index];
      }
      return null;

    },

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

    add: function(item) {

      items.push(item);
      playOrder.push(items.length - 1);

      if (this.isShuffling()) {
        // shuffle unplayed items in `playOrder`
        var unplayed = playOrder.splice(playOrderIndex + 1);
        playOrder = playOrder.concat(_shuffle(unplayed));
      }

      return item;

    },

    remove: function(itemIndex) {

      if (!_isValidIndex(itemIndex)) {
        return null;
      }

      // remove the item at `itemIndex`
      var removedItem = items.splice(itemIndex, 1)[0];

      // stop if `removedItem` is currently played or paused
      if (itemIndex === playOrder[playOrderIndex]) {
        this.stop();
      }

      // remove `itemIndex` from `playOrder`, and move indices > `itemIndex`
      // left by 1
      var newPlayOrder = [];
      var i;
      var len = playOrder.length;
      var j;
      for (i = 0; i < len; ++i) {
        j = playOrder[i];
        if (j !== itemIndex) {
          if (j > itemIndex) {
            j = j - 1;
          }
          newPlayOrder.push(j);
        }
      }
      playOrder = newPlayOrder;

      return removedItem;

    },

    reorder: function(oldIndex, newIndex) {

      // exit if no change, or invalid indices
      if (oldIndex === newIndex || !_isValidIndex(oldIndex) || !_isValidIndex(newIndex)) {
        return null;
      }

      // move item from `oldIndex` to `newIndex`
      var movedItem = items.splice(oldIndex, 1)[0];
      items.splice(newIndex, 0, movedItem);

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
        var i;
        var len = playOrder.length;
        var val;
        for (i = 0; i < len; ++i) {
          val = playOrder[i];
          if (val >= l && val <= r) {
            if (val === oldIndex) {
              playOrder[i] = newIndex;
            } else {
              playOrder[i] = val + offset;
            }
          }
        }
      } else {
        // adjust `playOrderIndex` if not shuffling
        if (playOrderIndex === oldIndex) {
          playOrderIndex = newIndex;
        }
      }

      return items[newIndex];

    },

    stop: function() {

      return _stop();

    },

    play: function(itemIndex) {

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
          return this.get(itemIndex);
        }
      } else {
        if (_isValidIndex(itemIndex)) {
          if (this.isShuffling()) {
            // move `itemIndex` to the front of `playOrder`
            var len = playOrder.length;
            var i;
            for (i = 0; i < len; ++i) {
              if (playOrder[i] === itemIndex) {
                playOrder.splice(i, 1);
                break;
              }
            }
            playOrder = [itemIndex].concat(playOrder);
            playOrderIndex = 0;
          } else {
            playOrderIndex = itemIndex;
          }
          state = PLAYING;
          return this.get(playOrder[playOrderIndex]);
        }
      }

      this.stop();
      return null;

    },

    pause: function() {

      if (!this.isStopped()) {
        state = PAUSED;
        return this.getCurrent();
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
        playOrder.sort();
        playOrder.splice(itemIndex, 1);
        playOrder = _shuffle(playOrder).concat([itemIndex]);
      }

      return _play(playOrderIndex);

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
        playOrder.sort();
        playOrder.splice(itemIndex, 1);
        playOrder = [itemIndex].concat(_shuffle(playOrder));
      }

      return _play(playOrderIndex);

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
        playOrder = _shuffle(playOrder);
      } else {
        playOrder.splice(playOrderIndex, 1);
        playOrder = [playOrderIndex].concat(_shuffle(playOrder));
      }
      return true;

    }

  };

};

module.exports = exports = jockey;
