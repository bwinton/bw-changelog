#!/usr/bin/env node
'use strict';

const log = require('git-log-parser');
const toArray = require('stream-to-array');

const tagRegex = /tag:\s*(v?\d+(\.\d+(\.\d+)?)?)[,\)]/gi;
const subjectRegex = /(feat(?:ure)?|fix):\s*(.*)/i;
const fixesRegex = /^Fixes (#[0-9]+)\.$/gm;

const makeTitle = (title, body) => {
  let fixes = [];
  let match = fixesRegex.exec(body);
  while (match) {
    fixes.push(match[1]);
    match = fixesRegex.exec(body);
  }
  if (fixes.length) {
    fixes = `  (Fixes ${fixes.join(', ')}.)`;
  }
  return `${title}${fixes}`;
};

const formatRelease = (release) => {
  let features = release.get('feat') || '';
  if (features) {
    features = `### New Features:

${features.map(i => '* ' + i).join('\n')}

`;
  }

  let fixes = release.get('fix') || '';
  if (fixes) {
    fixes = `### Fixes:

${fixes.map(i => '* ' + i).join('\n')}
`;
  }
  return `# ${release.get('tag')} - subject

${features}${fixes}
`;
};

log.fields.commit.decorations = 'd';
toArray(log.parse({'first-parent': true}), (err, commits) => {
  let releases = [new Map([['tag', 'v.Next']])];
  commits.forEach(commit => {
    let release = releases[releases.length - 1];
    let match = tagRegex.exec(commit.commit.decorations);
    if (match) {
      if (!release.get('fix') &&
          !release.get('feat')) {
        release.set('tag', match[1]);
      } else {
        releases.push(new Map([['tag', match[1]]]));
      }
    }
    match = subjectRegex.exec(commit.subject);
    if (match) {
      let [type, title] = match.slice(1);
      type = type.toLowerCase();
      if (type === 'feature') {
        type = 'feat';
      }
      let bucket = release.get(type);
      if (!bucket) {
        release.set(type, []);
        bucket = release.get(type);
      }
      bucket.push(makeTitle(title, commit.body));
    }
  });
  let release = releases[releases.length - 1];
  if (!release.get('fix') &&
      !release.get('feat')) {
    releases.pop();
  }
  releases = releases.map(formatRelease);
  process.stdout.write(releases.join('\n'));
});
