(function(root) {

  'use strict';

  var STOPPED = -1;

  var checkIndex = function(i, len) {
    if (i < 0 || i >= len) {
      throw new Error('invalid index: ' + i);
    }
  };

  var Jockey = function(items) {
    if (!(this instanceof Jockey)) {
      return new Jockey(items);
    }
    this.items = items || [];
    this.i = STOPPED;
    this.repeat = false;
    this.shuffle = false;
  };

  var j = Jockey.prototype;

  // Append `item` to the end of the playlist.
  j.add = function(item) {
    if (item == null) {
      throw new Error('need an item');
    }
    this.items.push(item);
  };

  // Insert `item` at index `i`. Throws if no `item`, and for invalid `i`.
  j.insert = function(item, i) {
    if (item == null) {
      throw new Error('need an item');
    }
    checkIndex(i, this.items.length + 1);
    this.items.splice(i, 0, item);
  };

  // Remove the item at index `i`. Throws for invalid `i`.
  j.remove = function(i) {
    checkIndex(i, this.items.length);
    this.items.splice(i, 1);
  };

  // Get the playlist size.
  j.size = function() {
    return this.items.length;
  };

  // Get the item at index `i`. Throws for invalid `i`.
  j.get = function(i) {
    checkIndex(i, this.items.length);
    return this.items[i];
  };

  // Returns the current index if playing, else returns `-1`.
  j.getCurrentIndex = function() {
    return this.i;
  };

  // Returns the currently-playing item if playing, else returns `null`.
  j.getCurrent = function() {
    return this.i === STOPPED ? null : this.items[this.i];
  };

  // Return `true` if playing.
  j.isPlaying = function() {
    return this.i !== STOPPED;
  };

  // Play the item at index 0 if no `i` specified. Else plays the item at index
  // `i`, and throws for invalid `i`.
  j.play = function(i) {
    var len = this.items.length;
    if (len) {
      if (i == null) {
        this.i = 0;
      } else {
        checkIndex(i, len);
        this.i = i;
      }
    }
  };

  // Stop playing.
  j.stop = function() {
    this.i = STOPPED;
  };

  // Toggle the `repeat` flag.
  j.toggleRepeat = function() {
    this.repeat = !this.repeat;
  };

  // Returns `true` if repeating.
  j.isRepeating = function() {
    return this.repeat;
  };

  // Plays the previous item if playing, wrapping to the end of the playlist if
  // repeating. Else stops.
  j.previous = function() {
    var len = this.items.length;
    var i = this.i;
    if (i !== STOPPED && len) {
      if (i > 0) {
        this.i--;
      } else {
        this.i = this.repeat ? len - 1 : STOPPED;
      }
    }
  };

  // Plays the next item if playing, wrapping to the start of the playlist if
  // repeating. Else stops.
  j.next = function() {
    var len = this.items.length;
    var i = this.i;
    if (i !== STOPPED && len) {
      if (i < len - 1) {
        this.i++;
      } else {
        this.i = this.repeat ? 0 : STOPPED;
      }
    }
  };

  // Move the item at `oldIndex` to `newIndex`. Throws if either indices
  // are invalid.
  j.reorder = function(oldIndex, newIndex) {
    var self = this;
    var len = self.items.length;
    checkIndex(oldIndex, len);
    checkIndex(newIndex, len);
    var item = self.items.splice(oldIndex, 1)[0];
    self.items.splice(newIndex, 0, item);
    var i = self.i;
    if (i !== STOPPED) {
      if (i === oldIndex) {
        self.i = newIndex;
      } else {
        if (oldIndex <= i && newIndex >= i) {
          self.i--;
        } else if (newIndex <= i && oldIndex >= i) {
          self.i++;
        }
      }
    }
  };

  /* istanbul ignore else */
  if (typeof module == 'object') {
    module.exports = Jockey;
  } else {
    root.jockey = Jockey;
  }

})(this);
