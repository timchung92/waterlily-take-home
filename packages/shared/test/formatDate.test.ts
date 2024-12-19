import { describe, expect, test } from 'vitest';

import { formatDate } from '@shared';

describe('formatDate', () => {
  test('date in string format is returned as formatted date', () => {
    const value = new Date('2023-10-10T22:30:19.577Z');
    const result = formatDate(value as any);
    expect(result).toBe('Oct 10, 2023');
  });

  test('date in string format is returned as formatted date', () => {
    const value = new Date('2023-10-10');
    const result = formatDate(value as any);
    expect(result).toBe('Oct 10, 2023');
  });
});
