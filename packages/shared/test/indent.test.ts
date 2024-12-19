import { indent } from '@shared';
import { expect, test } from 'vitest';

test('string array 3 elements and default indentation', () => {
  const expected = [
    '  a',
    '  b',
    '  c',
  ];

  const actual = indent(
    [
      'a',
      'b',
      'c',
    ]
  );

  expect(actual).toEqual(expected);
});


test('string array 3 elements and custom indentation', () => {
  const expected = [
    '     a',
    '     b',
    '     c' ];

  const actual = indent(['a', 'b', 'c'], 5);

  expect(actual).toEqual(expected);
});


test('string 3 lines and default indentation', () => {
  const expected = '  a\n  b\n  c\n';

  const actual = indent('a\nb\nc\n');

  expect(actual).toEqual(expected);
});