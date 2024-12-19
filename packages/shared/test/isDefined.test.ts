import { describe, expect, test } from 'vitest';

import { isDefined } from '@shared';

describe('isDefined', () => {
  test('undefined', () => {
    const a: string | undefined = undefined;
    const actual = isDefined(a);
    expect(actual).toBe(false);
  });

  test('null', () => {
    const actual = isDefined(null);
    expect(actual).toBe(false);
  });

  test('1', () => {
    const actual = isDefined(1);
    expect(actual).toBe(true);
  });

  test('{}', () => {
    const actual = isDefined({});
    expect(actual).toBe(true);
  });

  test('[]', () => {
    const actual = isDefined([]);
    expect(actual).toBe(true);
  });
});
