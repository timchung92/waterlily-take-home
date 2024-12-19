import { isMap, isObject, isSet } from 'lodash';
import { hasOwnProperty } from './hasOwnProperty';

export function inCollection<T>(collection: T[] | Set<T> | Map<T, unknown> | undefined | null): (item: T) => boolean;
export function inCollection<T extends PropertyKey>(collection: Record<T, unknown>): (item: T) => boolean;
export function inCollection<T>(
  collection: T[] | Set<T> | Map<T, unknown> | Record<PropertyKey, unknown> | undefined | null
): (item: T) => boolean {

  if (isMap(collection) || isSet(collection)) {
    return function inMap(item: T) {
      return collection.has(item);
    }
  }

  if (Array.isArray(collection)) {
    return function inArray(item: T) {
      return collection.includes(item);
    }
  }

  if (isObject(collection)) {
    return function inObject(item: T) {
      return hasOwnProperty(collection, item as PropertyKey);
    }
  }

  return () => false;
}
