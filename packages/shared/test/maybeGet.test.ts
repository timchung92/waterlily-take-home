import { expect, test } from 'vitest';
import { maybeGet } from '../src';

test('ok', () => {
  const o = { 'a': 'A' };
  const actual = maybeGet(o, o => o.a);
  expect(actual).toBe('A');
});

test('no prop', () => {
  const o = { a: 'A' };
  const b = { b: 'B' };

  const actual = maybeGet(o as unknown as typeof b, o => o.b);
  expect(actual).toBe(undefined);

});

test('getter on undefined', () => {
  const b = { b: 'B' };
  const actual = maybeGet(undefined as unknown as typeof b, o => o.b);
  expect(actual).toBe(undefined);
});
