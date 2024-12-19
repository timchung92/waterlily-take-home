import { describe, expect, test } from 'vitest';

import { fastMaybeParseDateString } from '@shared';

describe('fastMaybeParseDateString', () => {
  test('date in string format is returned as object Date', () => {
    const value = '2023-10-10T22:30:19.577Z';
    const result = fastMaybeParseDateString(value);
    expect(Object.prototype.toString.call(result)).toBe('[object Date]');
  });

  test('simple only date, in string format is returned as object Date', () => {
    const value = '2023-10-10';
    const result = fastMaybeParseDateString(value);
    expect(Object.prototype.toString.call(result)).toBe('[object Date]');
  });

  test('not valid text string as input should return the string itself', () => {
    const value = 'The string';
    const result = fastMaybeParseDateString(value);
    expect(result).toBe(value);
  });

  test('not string value parsed returns the same value', () => {
    const value = 1234;
    const result = fastMaybeParseDateString(value);
    expect(result).toBe(value);
  });
});
