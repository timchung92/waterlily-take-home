import { describe, expect, test } from 'vitest';

import { removeChars } from '@shared';

describe('removeChars', () => {
  test('abcdef => bcf', () => {
    const actual = removeChars('abcdef', 'ade');
    expect(actual).toBe('bcf');
  });

  test('abcdef => empty', () => {
    const actual = removeChars('abcdef', 'abcdef');
    expect(actual).toBe('');
  });

  test('abcdef => bcf with extras', () => {
    const actual = removeChars('abcdef', 'adexyx');
    expect(actual).toBe('bcf');
  });
});
