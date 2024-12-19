import { describe, expect, test } from 'vitest';
import { ArrayComparisonResult, compareArrays } from '@shared';

describe('compareArrays', () => {
  test('Arrays of strings are equal in the same order', () => {
    const inputExpected = ['one', 'two', 'three'];
    const inputActual = ['one', 'two', 'three'];

    const expected: ArrayComparisonResult<string> = {
      expected: inputExpected,
      actual: inputActual,
      missing: [],
      extra: [],
    };

    const actual = compareArrays(inputExpected, inputActual);

    expect(actual).toEqual(expected);
  });

  test('Arrays of strings with missing only', () => {
    const inputExpected = ['one', 'two', 'three'];
    const inputActual = ['one'];

    const expected: ArrayComparisonResult<string> = {
      expected: inputExpected,
      actual: inputActual,
      missing: ['two', 'three'],
      extra: [],
    };

    const actual = compareArrays(inputExpected, inputActual);

    expect(actual).toEqual(expected);
  });

  test('Arrays of strings with extra only', () => {
    const inputExpected = ['one'];
    const inputActual = ['one', 'two', 'three'];

    const expected: ArrayComparisonResult<string> = {
      expected: inputExpected,
      actual: inputActual,
      missing: [],
      extra: ['two', 'three'],
    };

    const actual = compareArrays(inputExpected, inputActual);

    expect(actual).toEqual(expected);
  });

  test('Arrays of strings with missing an extra', () => {
    const inputExpected = ['one', 'two'];
    const inputActual = ['two', 'three'];

    const expected: ArrayComparisonResult<string> = {
      expected: inputExpected,
      actual: inputActual,
      missing: ['one'],
      extra: ['three'],
    };

    const actual = compareArrays(inputExpected, inputActual);

    expect(actual).toEqual(expected);
  });

  test('Array of strings and empty actual', () => {
    const inputExpected = ['one', 'two', 'three'];
    const inputActual: string[] = [];

    const expected: ArrayComparisonResult<string> = {
      expected: inputExpected,
      actual: inputActual,
      missing: ['one', 'two', 'three'],
      extra: [],
    };

    const actual = compareArrays(inputExpected, inputActual);

    expect(actual).toEqual(expected);
  });

  test('Empty expected and actual array of strings', () => {
    const inputExpected: string[] = [];
    const inputActual: string[] = ['one', 'two', 'three'];

    const expected: ArrayComparisonResult<string> = {
      expected: inputExpected,
      actual: inputActual,
      missing: [],
      extra: ['one', 'two', 'three'],
    };

    const actual = compareArrays(inputExpected, inputActual);

    expect(actual).toEqual(expected);
  });

  test('Object equality', () => {
    const inputExpected = [{ a: 'A', b: 'B' }];
    const inputActual = [{ a: 'A', b: 'B' }];

    const expected: ArrayComparisonResult<(typeof inputExpected)[0]> = {
      expected: inputExpected,
      actual: inputActual,
      missing: [{ a: 'A', b: 'B' }],
      extra: [{ a: 'A', b: 'B' }],
    };

    const actual = compareArrays(inputExpected, inputActual);

    expect(
      actual,
      "Expected and actual didn't match. Remember compareArrays uses object equality, so the output from vitest might be confusing and appear that they match since vitest is checking content equality.",
    ).toEqual(expected);
  });
});
