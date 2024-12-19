/**
 * Given a type with at least some read-only properties, creates a type that has the same
 * properties but writable.
 *
 * https://stackoverflow.com/a/60066729/118703
 */
export type Mutable<T> = T extends object
  ? { -readonly [K in keyof T]: Mutable<T[K]> }
  : T;
