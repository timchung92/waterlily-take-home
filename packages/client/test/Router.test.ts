import { describe, expect, test } from 'vitest';
import { Home, Specs, pageToUrl } from '../src';

describe('pageToUrl', () => {

  test('Without parameters', () => {
    const actual = pageToUrl(Specs);
    expect(actual).toBe('/specs');
  });

  test('With three parameters', () => {
    const actual = pageToUrl(Home);
    expect(actual).toBe('/');
  });


});