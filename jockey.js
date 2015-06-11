(function(root) {

  'use strict';

  // Sentinel to indicate that the playlist is currently stopped.
  var STOPPED = -1;

  // Sentinel to indicate that shuffling is turned off.
  var NOT_SHUFFLING = false;

  //
  // Swaps `arr[i]` and `arr[j]` in place.
  //
  var swap = function(arr, i, j) {
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
    return arr;
  };

  //
  // Generate an integer in the specified range.
  //
  var rand = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  //
  // Constructor.
  //
  var Jockey = function(items) {

    // Allow `Jockey` to be called without the `new` keyword.
    if (!(this instanceof Jockey)) {
      return new Jockey(items);
    }

    // The items in the playlist.
    this.items = items || [];

    // If shuffling, this is a merely a shallow copy of the items in
    // `this.items`, but in a shuffled order.
    this.shuffled = NOT_SHUFFLING;

    // If not playing: `this.i` equals `STOPPED`.
    // If playing and shuffling: `this.i` refers to an item in `this.shuffled`,
    // ie. the currently-playing item is `this.shuffled[this.i]`.
    // If playing and not shuffling: `this.i` refers to an item in
    // `this.items`, ie. the currently-playing item is `this.items[this.i]`.
    this.i = STOPPED;

    // This flag will be `true` if we are repeating the playlist.
    this.repeatFlag = false;
  };

  // Store a reference to the Jockey `prototype` to facilitate minification.
  var j = Jockey.prototype;

  //
  // Add `item` to `this.items`.
  //
  j.add = function(item) {

    // Throw if no `item`.
    if (item == null) {
      throw new Error('need an item');
    }

    // Add `item` to `this.items`.
    this.items.push(item);

    // Add `item` to `this.shuffled`.
    if (this.isShuffling()) {
      this.shuffled.push(item);

      // Shuffle the "unplayed" subarray of `this.shuffled`.
      if (this.isPlaying()) {
        this._s(this.shuffled, this.i);
      }
    }
  };

  //
  // Remove the item at index `i` of `this.items`.
  //
  j.remove = function(i) {

    // Throw for invalid `i`.
    this._c(i);

    // Keep track of the currently-playing item.
    var currentItem = this.getCurrent();

    // Remove `item` from `this.items`.
    var item = this.items[i];
    this.items.splice(i, 1);

    // Remove `item` from `this.shuffled`. Update `i` to refer to an element
    // in `this.shuffled`.
    if (this.isShuffling()) {
      i = this.shuffled.indexOf(item);
      this.shuffled.splice(i, 1);
    }

    // Decrement `this.i` if the removed `item` occurs before the
    // current-playing item. If shuffling, `i` refers to an item in
    // `this.shuffled`. Else `i` refers to an item in `this.items`.
    if (i < this.i) {
      this.i--;
      return;
    }

    // Stop playing if the removed `item` is the currently-playing item.
    if (item == currentItem) {
      this.stop();
    }
  };

  //
  // Returns the playlist size.
  //
  j.size = function() {
    return this.items.length;
  };

  //
  // If no `i` specified, returns all the items in the playlist. Else returns
  // the item at index `i` of the playlist.
  //
  j.get = function(i) {

    // Return `this.items`.
    if (i == null) {
      return this.items;
    }

    // Throw for invalid `i`, else returns the item at index `i`.
    this._c(i);
    return this.items[i];
  };

  //
  // If playing, returns the index of the currently-playing item in
  // `this.items`. Else returns `STOPPED`.
  //
  j.getCurrentIndex = function() {
    if (this.isPlaying()) {
      // If shuffling, lookup the index of the currently-playing element
      // in `this.items`, else just return `this.i`.
      return this.isShuffling() ?
        this.items.indexOf(this.getCurrent()) :
        this.i;
    }
    return STOPPED;
  };

  //
  // If playing, returns the currently-playing item. Else returns `null`.
  //
  j.getCurrent = function() {
    if (this.isPlaying()) {
      return this.isShuffling() ?
        this.shuffled[this.i] :
        this.items[this.i];
    }
    return null;
  };

  //
  // Returns `true` if playing.
  //
  j.isPlaying = function() {
    return this.i !== STOPPED;
  };

  //
  // If no `i` specified: If shuffling, plays the item at index 0 of
  // `this.shuffled`, else plays the item at index 0 of `this.items`.
  // If `i` specified: Plays the item at index `i` of `this.items`.
  //
  j.play = function(i) {
    i = i || 0;
    this._c(i);
    this.i = i;
  };

  //
  // Stop playing.
  //
  j.stop = function() {

    // Generate a new shuffle if shuffling.
    if (this.isShuffling()) {
      this.shuffled = this._s(this.items.slice());
    }
    this.i = STOPPED;
  };

  //
  // Toggle the `repeatFlag`.
  //
  j.repeat = function() {
    this.repeatFlag = !this.repeatFlag;
  };

  //
  // Returns `true` if repeating.
  //
  j.isRepeating = function() {
    return this.repeatFlag;
  };

  //
  // Toggle shuffling.
  //
  j.shuffle = function() {

    if (this.isShuffling()) {

      // Get the index of the currently-playing item in `this.items`, and
      // update `this.i` accordingly. Now, because we are no longer shuffling,
      // `this.i` refers to an index in `this.items`.
      if (this.isPlaying()) {
        this.i = this.getCurrentIndex();
      }

      // Clean out `this.shuffled`.
      this.shuffled = NOT_SHUFFLING;
      return;
    }

    // Here we are not shuffling.
    if (this.isPlaying()) {

      // Make a shallow copy of `this.items`, and swap the currently-playing
      // item (at index `this.i`) to index 0.
      this.shuffled = this.items.slice();
      var item = this.shuffled[this.i];
      this.shuffled[this.i] = this.shuffled[0];
      this.shuffled[0] = item;

      // Sort `this.shuffled` from index 1 and up.
      this._s(this.shuffled, 1);

      // Set `this.i` to point to the first item in `this.shuffled`.
      this.i = 0;
      return;
    }

    // Here we are neither shuffling nor playing. So just make a shallow copy
    // of `this.items`, and shuffle it.
    this.shuffled = this._s(this.items.slice());

  };

  //
  // Returns `true` if shuffling.
  //
  j.isShuffling = function() {
    return this.shuffled !== NOT_SHUFFLING;
  };

  //
  // Decrement `this.i` if playing, wrapping to the end of the playlist if
  // repeating. Else stops.
  //
  j.previous = function() {

    // Do nothing if we are not playing, or if the playlist is empty.
    var len = this.items.length;
    if (!this.isPlaying() || !len) {
      return;
    }

    // A previous item exists, so just decrement `this.i`.
    if (this.i > 0) {
      this.i--;
      return;
    }

    // We are currently at the first item. Stop if not repeating.
    if (!this.isRepeating()) {
      return this.stop();
    }

    // If shuffling, generate a new shuffle.
    if (this.isShuffling()) {
      var currentItem = this.getCurrent();
      this.shuffled = this._s(this.items.slice());

      // If the currently-playing item was placed at index `len-1`, we need to
      // swap it with a random item taken from the rest of `this.items`. (This
      // is because `this.i` will be set to `len-1`, and the previous item must
      // be different from the currently-playing item!)
      if (len > 1 && this.shuffled[len-1] === currentItem) {
        var swapIndex = rand(0, this.items.length-2);
        swap(this.shuffled, len-1, swapIndex);
      }
    }

    // Since we're repeating, wraparound to the last element.
    this.i = len - 1;

  };

  //
  // Increment `this.i` if playing, wrapping to the end of the playlist if
  // repeating. Else stops.
  //
  j.next = function() {

    // Do nothing if we are not playing, or if the playlist is empty.
    var len = this.items.length;
    if (!this.isPlaying() || !len) {
      return;
    }

    // A next item exists, so just increment `this.i`.
    if (this.i < len - 1) {
      this.i++;
      return;
    }

    // We are currently at the last item. Stop if not repeating.
    if (!this.isRepeating()) {
      return this.stop();
    }

    // If shuffling, generate a new shuffle.
    if (this.isShuffling()) {
      var currentItem = this.getCurrent();
      this.shuffled = this._s(this.items.slice());

      // If the currently-playing item was placed at index 0, we need to swap
      // it with a random item taken from the rest of `this.items`. (This
      // is because `this.i` will be set to 0, and the next item must be
      // different from the currently-playing item!)
      if (len > 1 && this.shuffled[len-1] === currentItem) {
        var swapIndex = rand(0, this.items.length-2);
        swap(this.shuffled, len-1, swapIndex);
      }
    }

    // Since we're repeating, wraparound to the first element.
    this.i = 0;

  };

  //
  // Move the item at `oldIndex` in `this.items` to `newIndex`.
  //
  j.reorder = function(oldIndex, newIndex) {

    // Throw for invalid `oldIndex` or `newIndex`.
    this._c(oldIndex);
    this._c(newIndex);

    // Remove the item, and insert it at the `newIndex`.
    var item = this.items.splice(oldIndex, 1)[0];
    this.items.splice(newIndex, 0, item);

    // We do not need to adjust `this.i` if we are shuffling.
    if (this.isPlaying() && !this.isShuffling()) {

      // The item being moved is the currently-playing item.
      if (this.i === oldIndex) {
        this.i = newIndex;
        return;
      }

      // The item is being moved from after the currently-playing item to
      // before the currently-playing item.
      if (oldIndex <= this.i && newIndex >= this.i) {
        this.i--;
      } else {

        // The item is being moved from before the currently-playing item to
        // after the currently-playing item.
        if (oldIndex >= this.i && newIndex <= this.i) {
          this.i++;
        }
      }
    }

  };

  //
  // Throws if `i` is an invalid index.
  //
  j._c = function(i, len) {
    if (i < 0 || (i >= (len || this.items.length))) {
      throw new Error('invalid index: ' + i);
    }
  };

  //
  // Shuffles a subarray of `arr` in place, from the specified `startIndex` up
  // to `arr.length - 1`. Shuffles the entire `arr` if no `startIndex` was
  // specified. This is based on the Knuth shuffle.
  //
  j._s = function(arr, startIndex) {
    startIndex = startIndex || 0;
    var i = arr.length - 1;
    while (i > startIndex) {
      var j = Math.max(startIndex, Math.floor(Math.random() * (i + 1)));
      swap(arr, i, j);
      i--;
    }
    return arr;
  };

  /* istanbul ignore else */
  if (typeof module === 'object') {
    module.exports = Jockey;
  } else {
    root.jockey = Jockey;
  }

})(this);
