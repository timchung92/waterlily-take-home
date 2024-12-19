import {
  isArrayLike,
  isBoolean,
  isBuffer,
  isDate,
  isError,
  isFunction,
  isNumber,
  isRegExp,
  isSet,
  isString,
  isSymbol,
} from 'lodash';
import { isNullOrUndefined } from './isNullOrUndefined';
import { safeObjectEntries } from './safeObjectEntries';

export function flattenObjects(root: ObjectMap<unknown> | {}): ObjectMap<unknown> {
  // breadth-first search
  const pendingObjects = [ root ];
  const flat = {} as ObjectMap<unknown>;

  // use `for` loop because we're going to be adding to the array we're looping over as we loop over it,
  // recursive-type programming without recursion.
  for (let i = 0; i < pendingObjects.length; i++) {
    const obj = pendingObjects[ i ];
    safeObjectEntries(obj).forEach(([ key, value ]) => {
      if (
        isString(value) ||
        isBoolean(value) ||
        isNumber(value) ||
        isDate(value) ||
        isNullOrUndefined(value) ||
        isArrayLike(value) ||
        isSet(value) ||
        isBuffer(value) ||
        isError(value) ||
        isFunction(value) ||
        isRegExp(value) ||
        isSymbol(value)
      ) {
        if (!(key in flat)) {
          flat[ key ] = value;
        }
        return;
      }
      pendingObjects.push(value as ObjectMap<unknown>);
    });
  }

  return flat;
}
