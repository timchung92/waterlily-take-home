import { MemoizedFunction, isObject, memoize } from 'lodash';
import { ExError, isNullUndefinedOrEmpty } from '.';

export function memoizeByAll<TFunc extends (...args: any) => any>(func: TFunc): TFunc & MemoizedFunction {
  return memoize(func, memoizeByAllResolver);
}

const memoizeByAllSlot = Symbol('memoizeByAll');
let memoizeByAllCounter: number = 0;
interface Arg {
  [memoizeByAllSlot]?: string
}
function memoizeByAllResolver(...args: Arg[]): string {
  const keys = args.map(arg => {
    try {
      isObject(arg) && arg !== null && Object.isExtensible(arg)
        ? arg[memoizeByAllSlot] || (arg[memoizeByAllSlot] = (++memoizeByAllCounter).toString())
        : isNullUndefinedOrEmpty(arg)
          ? typeof arg
          : String(arg)
    } catch (error) {
      const ex = new ExError("memoizeByAllResolver", { args, arg }, error);
      console.log(ex.toString());
      throw ex;
    }
  });
  return keys.join('_$_');
}

