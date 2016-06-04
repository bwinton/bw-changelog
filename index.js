#!/usr/bin/env node

'use strict';
var exec = require('child_process').exec;
var regex = /tag:\s*(v?\d+(\.\d+(\.\d+)?)?)[,\)]/gi;
var cmd = 'git log --decorate --no-color';

var gitSemverTags = function(callback) {
  exec(cmd, {
    maxBuffer: Infinity
  }, function(err, data) {
    if (err) {
      callback(err);
      return;
    }

    var tags = [];

    data.split('\n').forEach(function(decorations) {
      var match;
      while (match = regex.exec(decorations)) {
        console.log(match);
        var tag = match[1];
        tags.push(tag);
      }
    });

    callback(null, tags);
  });
};

gitSemverTags(function(err, tags) {
  console.log(tags);
  //=> [ 'v2.0.0', 'v1.0.0' ]
});
