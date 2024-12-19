import {
  defaultKeyConverter,
  defaultValueConverter,
  RecordKeyConverter,
  RecordValueConverter,
  toRecord,
} from './toRecord';

export type ObjectMapKeyConverter<TIn> = RecordKeyConverter<TIn, string>;
export type ObjectMapValueConverter<TIn, TOut> = RecordValueConverter<TIn, TOut, string>;

export function toObjectMap<TIn, TOut = TIn>(
  source: TIn[],
  keyConverter: ObjectMapKeyConverter<TIn> = defaultKeyConverter,
  valueConverter: ObjectMapValueConverter<TIn, TOut>  = defaultValueConverter as ObjectMapValueConverter<TIn, TOut>,
): ObjectMap<TOut> {

  return toRecord(source, keyConverter, valueConverter);
}