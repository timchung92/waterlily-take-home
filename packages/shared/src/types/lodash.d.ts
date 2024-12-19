////////
//
// NOTE: These type definitions aren't actually working. Hence // @ts-ignore in clonePlus.ts
//
// See https://stackoverflow.com/questions/76808251/custom-type-definitions-for-lodash-internal-functions-not-picked-up-by-tsc
//

import type { ArrayIterator } from 'lodash';

type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

declare module 'lodash/_Stack' {
  declare interface _Stack {
    clear(): void;
    delete(key: string): boolean;
    get(key: string): unknown;
    has(key: string): boolean;
    set(key: string, value: unknown): _Stack;
  }
  export default _Stack;
}

declare module 'lodash/_arrayEach' {
  export default function _arrayEach<T>(
    array: T[],
    iteratee: ArrayIterator<T, boolean>,
  ): T[];
}

declare module 'lodash/_assignValue' {
  export default function _assignValue(
    target: unknown,
    key: string,
    value: unknown,
  ): void;
}

declare module 'lodash/_cloneBuffer' {
  export default function _cloneBuffer(
    buffer: Buffer,
    isDeep?: boolean,
  ): Buffer;
}

declare module 'lodash/_copyArray' {
  export default function _copyArray<T>(source: T[], target: T[]): T[];
}

declare module 'lodash/_copyObject' {
  export default function _copyObject(
    source: unknown,
    props: string[],
    object: unknown,
    customizer: (
      targetValue: unknown,
      sourceValue: unknown,
      key: string,
      target: unknown,
      source: unknown,
    ) => unknown,
  ): unknown;
}

declare module 'lodash/_cloneArrayBuffer' {
  export default function _cloneArrayBuffer(buffer: ArrayBuffer): ArrayBuffer;
}

declare module 'lodash/_cloneDataView' {
  export default function _cloneDataView(
    dataView: DataView,
    isDeep?: boolean,
  ): DataView;
}

declare module 'lodash/_cloneRegExp' {
  export default function _cloneRegExp(regexp: RegExp): RegExp;
}

declare module 'lodash/_cloneSymbol' {
  export default function _cloneSymbol(symbol: Symbol): Symbol;
}

declare module 'lodash/_cloneTypedArray' {
  export default function _cloneTypedArray(
    isTypedArray: TypedArray,
    isDeep: boolean,
  ): TypedArray;
}

declare module 'lodash/_copySymbols' {
  export default function _copySymbols<TSource, TResult>(
    source: TSource,
    target: TResult,
  ): TResult;
}

declare module 'lodash/_copySymbolsIn' {
  export default function _copySymbolsIn(
    source: TSource,
    target: TResult,
  ): TResult;
}

declare module 'lodash/_getAllKeys' {
  export default function _getAllKeys(source: unknown): (string | Symbol)[];
}

declare module 'lodash/_getAllKeysIn' {
  export default function _getAllKeysIn(source: unknown): (string | Symbol)[];
}

declare module 'lodash/_getTag' {
  export default function _getTag(value: unknown): string;
}

declare module 'lodash/_initCloneObject' {
  export default function _initCloneObject<T>(source: T): T;
}
