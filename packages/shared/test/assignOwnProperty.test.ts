import { describe, expect, test } from 'vitest';

import { assignOwnProperty } from '@shared';

describe('assignOwnProperty', () => {
  test('exists on source and not target', () => {
    const source = { a: 'A' };
    const target: Partial<typeof source> = {};
    const result = assignOwnProperty(source, target, 'a');
    expect(result).toBe(target);
    expect(source.a).toBe('A');
    expect(target.a).toBe('A');
  });

  test('exists on source and overrides target', () => {
    const source = { a: 'A' };
    const target = { a: 'ReplaceMe' };
    const result = assignOwnProperty(source, target, 'a');
    expect(result).toBe(target);
    expect(source.a).toBe('A');
    expect(target.a).toBe('A');
  });

  test('does not exist on source', () => {
    const source = {};
    const target = { a: 'B' };
    const result = assignOwnProperty(source, target, 'a');
    expect(result).toBeUndefined();
    expect(Object.keys(source)).toEqual([]);
    expect(target.a).toBe('B');
  });

  test('source is undefined', () => {
    const target = { a: 'B' };
    const result = assignOwnProperty(undefined, target, 'a');
    expect(result).toBeUndefined();
    expect(target.a).toBe('B');
  });

  test('target is undefined', () => {
    expect(() => assignOwnProperty({}, undefined, 'a')).toThrowError(
      /Invalid.+target.+must be defined/,
    );
  });

  test('property is undefined', () => {
    const source = { a: 'A' };
    const target = { a: 'B' };
    const result = assignOwnProperty(
      source,
      target,
      undefined as unknown as string,
    );
    expect(result).toBeUndefined();
    expect(source.a).toBe('A');
    expect(target.a).toBe('B');
  });
});
