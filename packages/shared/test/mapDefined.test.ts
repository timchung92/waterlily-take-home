import { describe, expect, test } from 'vitest';

import { mapDefined } from '@shared';
import { identity } from 'lodash';

describe('mapDefined', () => {
  test('Given array of 3 items with 1 undefined returns the 2 defined ones.', () => {
    const result = mapDefined([1, 2, 3], i => i === 2 ? undefined : i);
    expect(result).toEqual([1, 3]);
  });
});
