import { expect, test } from 'vitest';

import { numberLines } from '@shared';

test('three lines', () => {

  const actual = numberLines([ 'a', 'b', 'c' ]);
  const expected = [
    '1> a',
    '2> b',
    '3> c',
  ];

  expect(actual).toEqual(expected);
});

test('one line', () => {
  const actual = numberLines(['a']);
  const expected = [ 'a' ];

  expect(actual).toEqual(expected);
});

test('zero lines', () => {
  const actual = numberLines([]);
  const expected = [] as string[];

  expect(actual).toEqual(expected);
});
