import { first } from '@shared';
import { expect, test } from 'vitest';

test('empty returns undefined', () => {
  const actual = first([], () => true);
  expect(actual).toBeUndefined();
});

test('true returns first', () => {
  const actual = first(
    [
      'a',
      'b',
      'c'
    ],
    () => true
  );
  expect(actual).toBe('a');
});

test('test returns expected', () => {
  const actual = first(
    [
      'a',
      'b',
      'c',
    ],
    item => item === 'b',
  );
  expect(actual).toBe('b');
});

test('never returns undefined', () => {
  const actual = first(
    [
      'a',
      'b',
      'c',
    ],
    () => false,
  );
  expect(actual).toBeUndefined();

});
