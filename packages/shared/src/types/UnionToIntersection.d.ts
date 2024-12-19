/**
 * Crazy type takes a union and converts it to an intersection.
 *
 * @link https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
 */
declare type UnionToIntersection<U> =
  (
    U extends any
      ? (k: U) => void
      : never
  ) extends (
    k: infer I) => void
      ? I
      : never;

