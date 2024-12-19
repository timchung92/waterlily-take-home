import { describe, expect, test } from 'vitest';

import { formatDateTime } from '@shared';

describe('formatDateTime', () => {
  test('date in string format is returned as formatted date', () => {
    const value = new Date('2023-10-10T22:30:19.577Z');
    const result = formatDateTime(value);
    const tzOffset = value.getTimezoneOffset();
    let hour = 22 - tzOffset / 60;
    const ampm = hour > 12 ? (hour -= 12, 'PM') : 'AM';

    expect(result).toBe(`Oct 10, 2023 at ${ hour }:30 ${ ampm }`);
  });

});
