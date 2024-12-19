import { describe, expect, test } from "vitest";

import { unlessEmpty } from '@shared';

describe('unlessEmpty', () => {

  test('The one has value', () => {
    const expected = 'The one has value';
    const actual = unlessEmpty`The ${ 'one' } has value`;
    expect(actual).toBe(expected);
  });

  test('Nothing begets empty', () => {
    const expected = '';
    const actual = unlessEmpty`Nothing interpolated gets us nothing back`;
    expect(actual).toBe(expected);
  });

  test('Null begets empty', () => {
    const expected = '';
    const actual = unlessEmpty`${ null } begets empty`;
    expect(actual).toBe(expected);
  });

  test('Undefined begets empty', () => {
    const expected = '';
    const actual = unlessEmpty`${undefined} begets empty`;
    expect(actual).toBe(expected);
  });

  test('Empty begets empty', () => {
    const expected = '';
    const actual = unlessEmpty`${''} begets empty`;
    expect(actual).toBe(expected);
  });

  test('Mix begets results', () => {
    const expected = 'Mix begets results';
    const actual = unlessEmpty`${ undefined }Mix begets ${'results'}`;
    expect(actual).toBe(expected);
  });
});
