import { SpyInstance, vi } from 'vitest';

export function mockRandom(...args: number[]): SpyInstance<[], number> {
  const spy = vi.spyOn(Math, 'random');
  let callCount = 0;
  spy.mockImplementation(() => {
    callCount++;
    if (callCount > args.length) {
      throw new Error(
        `Unexpected call to mocked Math.random(). ${ args.length } values were provided but it was called ${ callCount } times.`
      );
    }
    return args[ callCount - 1 ];
  });
  return spy;
}
