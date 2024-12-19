import { isMap, isSet } from 'lodash';
import { isNullOrUndefined } from './isNullOrUndefined';

export function safeObjectEntries<T>(obj: { [s: string]: T } | ArrayLike<T> | undefined | null): [string, T][] {
  if (isNullOrUndefined(obj)) {
    return [];
  }

  if (isMap(obj) || isSet(obj)) {
    return [...obj.entries()];
  }

  try {
    return Object.entries(obj);
  } catch {
    return [];
  }
}
