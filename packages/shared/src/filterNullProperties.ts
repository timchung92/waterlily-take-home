import { isDefined, isNullOrUndefined, toRecord } from '.';

export function filterNullProperties<T extends {}>(obj: T): T {
  if (isNullOrUndefined(obj)) {
    return obj;
  }

  return toRecord(
    Object.entries(obj).filter(
      ([ _key, value ]) => isDefined(value)
    ),
    ([ key ]) => key,
    ([ , value ]) => value
  ) as T;
}
