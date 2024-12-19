/**
 * Calls the mapper for each item in a list sequentiall and returns the first non-null reponse
 * returned by the mapper.
 */
export function mapFirst<TSource, TMapped>(
  array: TSource[],
  mapper: (item: TSource) => TMapped | null
): TMapped | null {
  for (const item of array) {
    const mapped = mapper(item);
    if (mapped !== null) {
      return mapped;
    }
  }
  return null;
}
