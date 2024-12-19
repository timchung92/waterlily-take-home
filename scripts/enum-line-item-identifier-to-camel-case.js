
// sed -E 's/^INSERT INTO ([a-zA-Z]+).+/declare enum \1 {/ ; s/^  \(([0-9]+), .(.+).\)[,;]/  \2 = \1;/ ; s/^$/}/' ./tmp-enums.txt | node scripts/enum-line-item-identifier-to-camel-case.js

const readline = require('readline');
const camelCase = require('lodash/camelCase');

const lineRegex = /^  (.+)( = \d+[,;])$/;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', line => {
  console.log(formatLine(line));
});

function formatLine(line) {
  if (!line.startsWith('  ')) {
    return line;
  }

  return line.replace(lineRegex, replacer);
}

function replacer(_line, identifier, assignment) {
  return `  ${camelCase(identifier)}${assignment}`;
}

