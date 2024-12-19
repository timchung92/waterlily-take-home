import { describe, expect, test } from 'vitest';

import { replaceChars } from '@shared';

describe('replaceChars', () => {
  test('abcdef => _b__ef', () => {
    const actual = replaceChars('abcdef', 'acd', '_');
    expect(actual).toBe('_b__ef');
  });
});
