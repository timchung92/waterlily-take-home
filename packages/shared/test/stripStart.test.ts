import { expect, test } from 'vitest';
import { stripStart } from '../src';

test('strip it', () => {
  const actual = stripStart('abcdef', 'abc');
  expect(actual).toBe('def');
});

test('nothing to strip', () => {
  const actual = stripStart('abcdef', 'def');
  expect(actual).toBe('abcdef');
});
