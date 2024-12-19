/**
 * Runs a lambda intended to get a value from an object but handles any failure as if the
 * object or property does not existing, returning undefined.
 */
export function maybeGet<TOut>(getter: () => TOut): TOut | undefined;
export function maybeGet<TObj, TOut>(obj: TObj | undefined | null, getter: (obj: TObj) => TOut): TOut | undefined;
export function maybeGet<TObj, TOut>(...args: unknown[]): TOut | undefined {
  try {
    if (args.length === 1) {
      const [ getter ] = args as [ () => TOut ];
      return getter();
    }

    const [ obj, objGetter ] = args as [ TObj, (obj: TObj) => TOut ];
    return obj === undefined || obj === null
      ? undefined
      : objGetter(obj);
  } catch {
    return undefined;
  }
}
