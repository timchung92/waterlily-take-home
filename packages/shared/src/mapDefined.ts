import { isNullUndefinedOrEmpty } from './isNullUndefinedOrEmpty';

export function mapDefined<TIn, TOut>(list: TIn[], converter: (item: TIn, index?: number) => TOut | undefined): TOut[] {
  if (isNullUndefinedOrEmpty(list)) {
    return [];
  }
  const len = list.length;
  const result = new Array<TOut>(len);
  let outIndex = 0;
  for (let inIndex = 0; inIndex < len; inIndex++) {
    const converted = converter(list[ inIndex ], inIndex);
    if (converted !== undefined && converted !== null) {
      result[ outIndex++ ] = converted;
    }
  }
  result.length = outIndex;
  return result;
}
