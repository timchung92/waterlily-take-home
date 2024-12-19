import { describe, expect, test } from 'vitest';
import { ObjectComparisonResult, compareKeys } from '@shared';

describe('compareKeys', () => {
  test('Expected object are equal to Actual object', () => {
    const inputExpected = { one: 'one', two: 'two', three: 'three' };
    const inputActual = { one: 'one', two: 'two', three: 'three' };

    const expected: ObjectComparisonResult<unknown> = {
      expected: inputExpected,
      actual: inputActual,
      missing: [],
      extra: [],
    };

    const actual = compareKeys(inputExpected, inputActual);

    expect(actual).toEqual(expected);
  });

  test('Expected object are not equal to Actual object', () => {
    const inputExpected = { one: 'one', two: 'two', three: 'three' };
    const inputActual = { One: 'one', Two: 'two', Three: 'three' };

    const expected: ObjectComparisonResult<unknown> = {
      expected: inputExpected,
      actual: inputActual,
      missing: ['one', 'two', 'three'],
      extra: ['One', 'Two', 'Three'],
    };

    const actual = compareKeys(inputExpected, inputActual as any);

    expect(actual).toEqual(expected);
  });

  test('Expected object is not equal to Actual object by a single item', () => {
    const inputExpected = { one: 'one', two: 'two', three: 'three' };
    const inputActual = { One: 'one', two: 'two', three: 'three' };

    const expected: ObjectComparisonResult<unknown> = {
      expected: inputExpected,
      actual: inputActual,
      missing: ['one'],
      extra: ['One'],
    };

    const actual = compareKeys(inputExpected, inputActual as any);

    expect(actual).toEqual(expected);
  });

  test('Empty Expected object and an Actual object correctly populated', () => {
    const inputExpected = {};
    const inputActual = { one: 'one', two: 'two', three: 'three' };

    const expected: ObjectComparisonResult<unknown> = {
      expected: inputExpected,
      actual: inputActual,
      missing: [],
      extra: ['one', 'two', 'three'],
    };

    const actual = compareKeys(inputExpected, inputActual as any);

    expect(actual).toEqual(expected);
  });

  test('Empty Actual object and an Expected object correctly populated', () => {
    const inputExpected = { one: 'one', two: 'two', three: 'three' };
    const inputActual = {};

    const expected: ObjectComparisonResult<unknown> = {
      expected: inputExpected,
      actual: inputActual,
      missing: ['one', 'two', 'three'],
      extra: [],
    };

    const actual = compareKeys(inputExpected, inputActual as any);

    expect(actual).toEqual(expected);
  });
});
