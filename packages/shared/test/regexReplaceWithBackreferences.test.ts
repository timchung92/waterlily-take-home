import { regexReplaceWithBackreferences } from '@shared';
import { expect, test } from 'vitest';

test('Two group replacement', () => {
  const actual = regexReplaceWithBackreferences(
    'This is a source test',
    /(is) (.) /,
    '<$1> {$2} '
  );
  const expected = 'This <is> {a} source test';
  expect(actual).toBe(expected);
});

test('Or single replacement', () => {
  const actual = regexReplaceWithBackreferences(
    'This is a source test',
    /is a source (thing|test)/,
    'was $1ed',
  );
  const expected = 'This was tested';
  expect(actual).toBe(expected);
});

test('Default replacement', () => {
  const actual = regexReplaceWithBackreferences(
    'This is a source test',
    /is (a) source/,
  );
  const expected = 'This a test';
  expect(actual).toBe(expected);
});