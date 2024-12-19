export function entriesToRecord<TKey extends string | number | symbol, TValue>(
  source: [TKey, TValue][],
) {
  return source.reduce((map, [key, value]) => {
    map[key] = value;
    return map;
  }, {} as Record<TKey, TValue>);
}
