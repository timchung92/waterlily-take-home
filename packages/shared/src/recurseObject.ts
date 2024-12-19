import { getEntriesUniversal } from './getEntriesUniversal';

/**
 *  Recurisvely loops through an object structure and calls [iteratee] on each item found.
 */
export function recurseObject<T>(
  obj: T,
  iteratee: (value: unknown, key: unknown, parent: unknown, root: T) => void
): T {
  const root = obj;

  recurseObjectImpl(obj);

  return obj;

  function recurseObjectImpl(item: unknown) {
    for (const entry of getEntriesUniversal(item)) {
      const [ key, value ] = entry;
      iteratee(value, key, item, root);
      recurseObjectImpl(value);
    }
  }
}
