#!/usr/bin/env node
'use strict';

const gitTags = require('./git-version-tags');

gitTags((err, tags) => {
  tags = ['HEAD', ...tags];
  //=> [ 'HEAD', 'v2', 'v1.0.0', '0.9' ]
});
