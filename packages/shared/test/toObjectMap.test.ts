import { describe, expect, test } from 'vitest';

import { toObjectMap } from '@shared';

describe('toObjectMap', () => {

  test('simple array', () => {
    const actual = toObjectMap([ 'a', 'b', 'c' ]);
    const expected = {
      a: 'a',
      b: 'b',
      c: 'c',
    };
    expect(actual).toEqual(expected);
  });

  test('key converter', () => {
    const actual = toObjectMap(
      [ 'a', 'b', 'c' ],
      c => c.toUpperCase()
    );
    const expected = {
      A: 'a',
      B: 'b',
      C: 'c',
    };
    expect(actual).toEqual(expected);
  });

  test('key and value converters', () => {
    const actual = toObjectMap(
      [ 'a', 'b', 'c' ],
      c => c.toUpperCase(),
      c => c.charCodeAt(0)
    );
    const expected = {
      A: 97,
      B: 98,
      C: 99,
    };
    expect(actual).toEqual(expected);
  });
});