'use strict';

var test = require('tape');
var jockey = require('..');

//
// size()
//

test('returns the playlist size', function(t) {
  t.plan(1);
  var j = jockey([1, 2, 3]);
  t.equal(j.size(), 3);
});
