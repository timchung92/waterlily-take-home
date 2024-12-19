
/**
 * Given a union of keys and a value type returns a type that
 * has a single key which is one of the specified keys and
 * value that is of the value type.
 *
 * See (https://stackoverflow.com/a/60873215/118703).
 *
 * @example
 *
 * type Keys = 'a' | 'b' | 'c';
 *
 * type ObjectWithOneKey = ExactlyOneKey<Keys, string>;
 *
 * // valid
 * const o1: ObjectWithOneKey = { a: 'A' };
 * const o2: ObjectWithOneKey = { b: 'B' };
 * const o3: ObjectWithOneKey = { c: 'C' };
 *
 * // invalid
 * const o4: ObjectWithOneKey = { a: 'A', b: 'B' };
 */
type OneOf<K extends keyof any, V, KK extends keyof any = K> = {
  [P in K]: { [Q in P]: V } & { [Q in Exclude<KK, P>]?: never } extends infer O
    ? { [Q in keyof O]: O[Q] }
    : never;
}[ K ];
