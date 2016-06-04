'use strict';

const exec = require('child_process').exec;
const regex = /tag:\s*(v?\d+(\.\d+(\.\d+)?)?)[,\)]/gi;
const cmd = 'git log --decorate --no-color';

module.exports = callback => {
  exec(cmd, {
    maxBuffer: Infinity
  }, (err, data) => {
    if (err) {
      callback(err);
      return;
    }

    let tags = [];

    data.split('\n').forEach(decorations => {
      let match = regex.exec(decorations);
      while (match) {
        let tag = match[1];
        tags.push(tag);
        match = regex.exec(decorations);
      }
    });

    callback(null, tags);
  });
};
