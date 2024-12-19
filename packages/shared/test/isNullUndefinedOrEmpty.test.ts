import { describe, expect, test } from 'vitest';

import { isNullUndefinedOrEmpty } from '@shared';

describe('isNullUndefinedOrEmpty', () => {
  test('undefined', () => {
    const actual = isNullUndefinedOrEmpty(undefined);
    expect(actual).toBe(true);
  });

  test('null', () => {
    const actual = isNullUndefinedOrEmpty(null);
    expect(actual).toBe(true);
  });

  test('1', () => {
    const actual = isNullUndefinedOrEmpty(1);
    expect(actual).toBe(false);
  });

  test('{}', () => {
    const actual = isNullUndefinedOrEmpty({});
    expect(actual).toBe(true);
  });

  test('[]', () => {
    const actual = isNullUndefinedOrEmpty([]);
    expect(actual).toBe(true);
  });

  test("{ a: 'A' }", () => {
    const actual = isNullUndefinedOrEmpty({ a: 'A' });
    expect(actual).toBe(false);
  });

  test('[ 1 ]', () => {
    const actual = isNullUndefinedOrEmpty([1]);
    expect(actual).toBe(false);
  });

  test('Date', () => {
    const actual = isNullUndefinedOrEmpty(new Date());
    expect(actual).toBe(false);
  });

  test('Function', () => {
    const actual = isNullUndefinedOrEmpty(() => 1);
    expect(actual).toBe(false);
  });

  test('Map (empty)', () => {
    const actual = isNullUndefinedOrEmpty(new Map<string, string>());
    expect(actual).toBe(true);
  });

  test('Map (non-empty)', () => {
    const actual = isNullUndefinedOrEmpty(
      new Map<string, string>([['a', 'b']]),
    );
    expect(actual).toBe(false);
  });

  test('Set (empty)', () => {
    const actual = isNullUndefinedOrEmpty(new Set<string>());
    expect(actual).toBe(true);
  });

  test('Set (non-empty)', () => {
    const actual = isNullUndefinedOrEmpty(new Set<string>(['a']));
    expect(actual).toBe(false);
  });

  test('ArrayBuffer (empty)', () => {
    const actual = isNullUndefinedOrEmpty(new ArrayBuffer(0));
    expect(actual).toBe(true);
  });

  test('ArrayBuffer (non-empty)', () => {
    const actual = isNullUndefinedOrEmpty(new ArrayBuffer(5));
    expect(actual).toBe(false);
  });
});
