import { ExError } from './ExError';
import { hasOwnProperty } from './hasOwnProperty';
import { isDefined } from './isDefined';
import { isNullOrUndefined } from './isNullOrUndefined';

/**
 * If the source object has the specified propery, that property is assigned to target and target is returned;
 * otherwise, [undefined] is returned.
 */
export function assignOwnProperty<T>(
  source: T,
  target: T,
  property: string,
): T | undefined {
  if (isNullOrUndefined(target)) {
    throw new ExError(
      'Invalid `target` provided for assignOwnProperty; `target` must be defined.',
      {
        source,
        target,
        property,
      },
    );
  }

  if (isDefined(source) && hasOwnProperty(source, property)) {
    (target as Record<string, unknown>)[property] = source[property];
    return target;
  }
  return undefined;
}
