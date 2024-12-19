/* **********

  clonePlus
  ---------

  Adapted from LoDash baseClone. Adds clearer usage patterns through prop parameter deconstructions and
  additional functionality, particularly limiting array length, object depth, and customizer ability to
  signify that a key/value pair should be excluded.


  Original License
  ----------------

  The MIT License

  Copyright JS Foundation and other contributors <https://js.foundation/>

  Based on Underscore.js, copyright Jeremy Ashkenas,
  DocumentCloud and Investigative Reporters & Editors <http://underscorejs.org/>

  This software consists of voluntary contributions made by many
  individuals. For exact contribution history, see the revision history
  available at https://github.com/lodash/_lodash

  The following license applies to all parts of this software except as
  documented below:

  ====

  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

  ====

  Copyright and related rights for sample code are waived via CC0. Sample
  code is defined as all source code displayed within the prose of the
  documentation.

  CC0: http://creativecommons.org/publicdomain/zero/1.0/

  ====

  Files located in the node_modules and vendor directories are externally
  maintained libraries used by this software which have their own
  licenses; we recommend you read them, as their terms may differ from the
  terms above.
*/

// @ts-ignore
import Stack from 'lodash/_Stack';
// @ts-ignore
import arrayEach from 'lodash/_arrayEach';
// @ts-ignore
import assignValue from 'lodash/_assignValue';
// @ts-ignore
import cloneBuffer from 'lodash/_cloneBuffer';
// @ts-ignore
import copyArray from 'lodash/_copyArray';
// @ts-ignore
import copyObject from 'lodash/_copyObject';
// @ts-ignore
import cloneArrayBuffer from 'lodash/_cloneArrayBuffer';
// @ts-ignore
import cloneDataView from 'lodash/_cloneDataView';
// @ts-ignore
import cloneRegExp from 'lodash/_cloneRegExp';
// @ts-ignore
import cloneSymbol from 'lodash/_cloneSymbol';
// @ts-ignore
import cloneTypedArray from 'lodash/_cloneTypedArray';
// @ts-ignore
import copySymbols from 'lodash/_copySymbols';
// @ts-ignore
import copySymbolsIn from 'lodash/_copySymbolsIn';
// @ts-ignore
import getAllKeys from 'lodash/_getAllKeys';
// @ts-ignore
import getAllKeysIn from 'lodash/_getAllKeysIn';
// @ts-ignore
import getTag from 'lodash/_getTag';
// @ts-ignore
import initCloneObject from 'lodash/_initCloneObject';
import isBuffer from 'lodash/isBuffer';
import isObject from 'lodash/isObject';
import isTypedArray from 'lodash/isTypedArray';
import keys from 'lodash/keys';
import keysIn from 'lodash/keysIn';
import { isNumber } from 'lodash';

import { assignOwnProperty } from './assignOwnProperty';
import { copyArrayTo } from './copyArrayTo';

type Stack = typeof Stack;

/** `Object#toString` result references. */
const argsTag = '[object Arguments]';
const arrayTag = '[object Array]';
const boolTag = '[object Boolean]';
const dateTag = '[object Date]';
const errorTag = '[object Error]';
const mapTag = '[object Map]';
const numberTag = '[object Number]';
const objectTag = '[object Object]';
const regexpTag = '[object RegExp]';
const setTag = '[object Set]';
const stringTag = '[object String]';
const symbolTag = '[object Symbol]';
const weakMapTag = '[object WeakMap]';

const arrayBufferTag = '[object ArrayBuffer]';
const dataViewTag = '[object DataView]';
const float32Tag = '[object Float32Array]';
const float64Tag = '[object Float64Array]';
const int8Tag = '[object Int8Array]';
const int16Tag = '[object Int16Array]';
const int32Tag = '[object Int32Array]';
const uint8Tag = '[object Uint8Array]';
const uint8ClampedTag = '[object Uint8ClampedArray]';
const uint16Tag = '[object Uint16Array]';
const uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values supported by `clone`. */
const cloneableTags: ObjectMap<boolean> = {};
cloneableTags[argsTag] =
  cloneableTags[arrayTag] =
  cloneableTags[arrayBufferTag] =
  cloneableTags[dataViewTag] =
  cloneableTags[boolTag] =
  cloneableTags[dateTag] =
  cloneableTags[float32Tag] =
  cloneableTags[float64Tag] =
  cloneableTags[int8Tag] =
  cloneableTags[int16Tag] =
  cloneableTags[int32Tag] =
  cloneableTags[mapTag] =
  cloneableTags[numberTag] =
  cloneableTags[objectTag] =
  cloneableTags[regexpTag] =
  cloneableTags[setTag] =
  cloneableTags[stringTag] =
  cloneableTags[symbolTag] =
  cloneableTags[uint8Tag] =
  cloneableTags[uint8ClampedTag] =
  cloneableTags[uint16Tag] =
  cloneableTags[uint32Tag] =
    true;
cloneableTags[errorTag] = cloneableTags[weakMapTag] = false;

export const suppressKeyValuePair = Symbol('suppressKeyValuePair');

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
 * */
function initCloneByTag(object: object, tag: string, isDeep: boolean) {
  const Ctor = object.constructor as unknown;
  switch (tag) {
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    case boolTag:
    case dateTag:
      return new (Ctor as Constructor<[number], boolean | Date>)(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag:
    case float64Tag:
    case int8Tag:
    case int16Tag:
    case int32Tag:
    case uint8Tag:
    case uint8ClampedTag:
    case uint16Tag:
    case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      return new (Ctor as { new(): Map<any, any> })();

    case numberTag:
    case stringTag:
      return new (Ctor as Constructor<[object], number | string>)(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return new (Ctor as Constructor<[], Set<any>>)();

    case symbolTag:
      return cloneSymbol(object);
  }
}

/**
 * Initializes an array clone.
 */
function initCloneArray<T>(array: T[], maxArrayLength: number | undefined): T[] {
  const { length } = array;
  const cloneLength = isNumber(maxArrayLength)
    ? Math.min(length, maxArrayLength)
    : length;
  const result = new (array.constructor as Constructor<[number], T[]>)(cloneLength);

  // Add properties assigned by `RegExp#exec`.
  assignOwnProperty(array, result, 'index');
  assignOwnProperty(array, result, 'input');
  return result;
}

export type ClonePlusOptions = {
  isDeep?: boolean;
  flatten?: boolean;
  cloneSymbols?: boolean;
  customizer?: (value: any, key: unknown, parent: any, foundObjects: Stack) => any;
  maxArrayLength?: number;
  maxDepth?: number;
};

/**
 * Implementation of LoDash's `clone` with support for all variants plus ability to limit the number of
 * array items included and the depth of the object structure.
 */
export function clonePlus<T>(value: T, options: ClonePlusOptions = {}): T {

  const wrappedOptions = {
    ...options,
    customizer: wrapCustomizerWithSuppresser(options.customizer),
  } as ClonePlusOptions;


  return clonePlusImpl(
    value,
    wrappedOptions,
    undefined,
    null,
    new Stack(),
    1,
  ) as T; // root call cannot return [suppressKeyValuePair]
}

function wrapCustomizerWithSuppresser(customizer: ClonePlusOptions[ 'customizer' ]) {

  if (customizer === undefined) {
    return undefined;
  }

  return function customizerWithSuppresser(
    value: any,
    key: unknown,
    parent: any,
    foundObjects: Stack,
  ) {
    const customResult = customizer(value, key, parent, foundObjects);
    return customResult !== suppressKeyValuePair
      ? customResult ?? value

      : parent === null
        ? value
        : suppressKeyValuePair;
  };
}

function clonePlusImpl<T>(
  value: T,
  options: ClonePlusOptions,
  key: unknown,
  parent: any,
  foundObjects: Stack,
  depth: number,
): T | typeof suppressKeyValuePair {
  const {
    flatten,
    cloneSymbols,
    customizer,
    maxArrayLength,
    maxDepth,
  } = options;

  const isDeep = options.isDeep || maxDepth;

  let result: any;

  if (customizer) {
    const customResult = customizer(value, key, parent, foundObjects);
    if (customResult !== value) {
      return customResult;
    }
  }

  if (!isObject(value)) {
    return value;
  }
  const isArr = Array.isArray(value);
  const tag = getTag(value);
  if (isArr) {
    result = initCloneArray(value, maxArrayLength);
    if (!isDeep) {
      return copyArrayTo(
        value,
        0,
        (maxArrayLength ?? value.length) - 1,
        result
      ) as T;
    }
  } else {
    const isFunc = typeof value === 'function';

    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !parent)) {
      result = flatten || isFunc ? {} : initCloneObject(value);
      if (!isDeep) {
        return flatten
          ? copySymbolsIn(value, copyObject(value, keysIn(value), result))
          : copySymbols(value, Object.assign(result, value));
      }
    } else {
      if (isFunc || !cloneableTags[tag]) {
        return (parent ? value : {}) as unknown as T;
      }
      result = initCloneByTag(value, tag, Boolean(isDeep));
    }
  }
  // Check for circular references and return its corresponding clone.
  const stacked = foundObjects.get(value);
  if (stacked) {
    return stacked;
  }
  foundObjects.set(value, result);

  if (maxDepth && depth > maxDepth) {
    return result;
  }

  if (tag == mapTag) {
    (value as unknown as Map<unknown, unknown>).forEach((subValue, key) => {
      const clonedSubValue = clonePlusImpl(
        subValue,
        options,
        key,
        value,
        foundObjects,
        depth + 1,
      );

      if (clonedSubValue !== suppressKeyValuePair) {
        result.set(key, clonedSubValue);
      }
    });
    return result;
  }

  if (tag == setTag) {
    (value as unknown as Set<unknown>).forEach(
      subValue => {
        const clonedSubValue = clonePlusImpl(
          subValue,
          options,
          subValue,
          value,
          foundObjects,
          depth + 1
        );

        if (clonedSubValue !== suppressKeyValuePair) {
          result.add(clonedSubValue);
        }
      }
    );
  }

  if (isTypedArray(value)) {
    return result;
  }

  const keysFunc = cloneSymbols
    ? flatten
      ? getAllKeysIn
      : getAllKeys
    : flatten
    ? keysIn
    : keys;

  const props = isArr ? undefined : keysFunc(value);
  arrayEach(props || value, (subValue: unknown, key: unknown) => {
    let appliedKey: unknown;
    let appliedSubValue: unknown;

    if (props) {
      appliedKey = subValue;
      appliedSubValue = (value as any)[appliedKey as unknown as string];
    } else {

      if (maxArrayLength) {
        const index = Number.parseInt(key as string, 10);
        if (!Number.isNaN(index) && index >= maxArrayLength) {
          return;
        }
      }

      appliedKey = key;
      appliedSubValue = subValue;
    }
    // Recursively populate clone (susceptible to call stack limits).
    const clonedSubValue = clonePlusImpl(
      appliedSubValue,
      options,
      appliedKey,
      value,
      foundObjects,
      depth + 1,
    );

    if (clonedSubValue !== suppressKeyValuePair) {
      assignValue(
        result,
        appliedKey,
        clonedSubValue,
      );
    }
  });
  return result;
}
