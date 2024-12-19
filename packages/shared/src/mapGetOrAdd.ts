export function mapGetOrAdd<TKey, TValue>(map: Map<TKey, TValue>, key: TKey, valueCreator: () => TValue): TValue {

  const existing = map.get(key);
  if (existing !== undefined && existing !== null) {
    return existing;
  }

  const toAdd = valueCreator();
  map.set(key, toAdd);

  return toAdd;
}
