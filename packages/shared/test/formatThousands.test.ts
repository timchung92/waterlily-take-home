import { describe, expect, test } from 'vitest';

import { formatThousands } from '@shared';

describe('formatThousands', () => {
  test('given the number 1000 returns the formatted number', () => {
    const result = formatThousands(1000);
    expect(result).toBe('1,000');
  });
  test('given a null value returns the character "-" ', () => {
    const result = formatThousands(null as any);
    expect(result).toBe('');
  });
  test('given a undefined value returns the character "-" ', () => {
    const result = formatThousands(undefined as any);
    expect(result).toBe('');
  });
});
