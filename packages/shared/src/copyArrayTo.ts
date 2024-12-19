
/**
 * Copies the values of `source` to `array` for the specified indices inclusive of end.
 */
export function copyArrayTo<T>(
  source: T[],
  startIndex: number,
  endIndex: number,
  target?: T[]
): T[] {
  var index = startIndex - 1,
      length = Math.min(source.length, endIndex + 1);

  const result = target ?? new Array<T>(length);
  while (++index < length) {
    result[index] = source[index];
  }
  return result;
}