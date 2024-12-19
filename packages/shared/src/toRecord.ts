import { isNullOrUndefined } from "./isNullOrUndefined";

export type AllowedKey = keyof any;

export type RecordKeyConverter<TIn, TKey extends AllowedKey = string> = (
  value: TIn,
  index: number,
) => TKey;
export type RecordValueConverter<TIn, TOut, TKey extends AllowedKey = string> = (
  value: TIn,
  index: number,
  key: TKey,
) => TOut;

export function toRecord<TIn, TOut = TIn, TKey extends AllowedKey = string>(
  source: TIn[],
  keyConverter: RecordKeyConverter<TIn, TKey> = defaultKeyConverter as any,
  valueConverter: RecordValueConverter<TIn, TOut, TKey> = defaultValueConverter as any
): Record<TKey, TOut> {
  return source.reduce((map, value, index) => {
    const key = keyConverter(value, index);
    map[key] = valueConverter(value, index, key);
    return map;
  }, {} as Record<TKey, TOut>);
}

export function defaultKeyConverter<TIn>(value: TIn, _index: number): string {
  return isNullOrUndefined(value) ? "" : String(value);
}

export function defaultValueConverter<TIn>(
  value: TIn,
  _index: number,
  _key: string
): TIn {
  return value;
}
