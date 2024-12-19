import { describe, expect, test } from 'vitest';

import { copyArrayTo } from '@shared';

describe('copyArrayTo', () => {
  test('simple full array to empty array', () => {
    const source = [1, 2, 3];
    const target: typeof source = [];
    const actual = copyArrayTo(source, 0, 2, target);
    expect(actual).toEqual(source);
    expect(actual).not.toBe(source);
    expect(actual).toBe(target);
  });

  test('simple array to new array', () => {
    const source = [1, 2, 3];
    const actual = copyArrayTo(source, 0, 2);
    expect(actual).toEqual(source);
    expect(actual).not.toBe(source);
  });

  test('part of array to sparse array', () => {
    const source = [1, 2, 3, 4, 5, 6];
    const target: typeof source = [];
    const actual = copyArrayTo(source, 1, 3, target);
    expect(actual).toEqual([, 2, 3, 4]);
    expect(actual).not.toBe(source);
    expect(actual).toBe(target);
  });

  test('overwrite part of target array', () => {
    const source = [1, 2, 3, 4, 5];
    const target = [6, 7, 8, 9, 0];
    const actual = copyArrayTo(source, 1, 3, target);
    expect(actual).toEqual([6, 2, 3, 4, 0]);
    expect(actual).not.toBe(source);
    expect(actual).toBe(target);
  });
});

