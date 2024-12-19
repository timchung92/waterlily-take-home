import { describe, expect, test } from 'vitest';

import { formatOrdinal } from '@shared';

describe('formatOrdinal', () => {
  test('given a digit 1 returns 1st', () => {
    const result = formatOrdinal(1);
    expect(result).toBe('1st');
  });
  test('given a digit 2 returns 2nd', () => {
    const result = formatOrdinal(2);
    expect(result).toBe('2nd');
  });
  test('given a digit 3 returns 3rd', () => {
    const result = formatOrdinal(3);
    expect(result).toBe('3rd');
  });
  test('given a digit 4 returns 4th', () => {
    const result = formatOrdinal(4);
    expect(result).toBe('4th');
  });
});
