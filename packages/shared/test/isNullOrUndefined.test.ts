import { describe, expect, test } from 'vitest';

import { isNullOrUndefined } from '@shared';

describe('isNullOrUndefined', () => {
  test('undefined', () => {
    const actual = isNullOrUndefined(undefined);
    expect(actual).toBe(true);
  });

  test('null', () => {
    const actual = isNullOrUndefined(null);
    expect(actual).toBe(true);
  });

  test('1', () => {
    const actual = isNullOrUndefined(1);
    expect(actual).toBe(false);
  });

  test('{}', () => {
    const actual = isNullOrUndefined({});
    expect(actual).toBe(false);
  });

  test('[]', () => {
    const actual = isNullOrUndefined([]);
    expect(actual).toBe(false);
  });
});
