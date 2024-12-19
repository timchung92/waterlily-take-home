import { ExError } from './ExError';
import { assertNotEmpty } from './assertNotEmpty';

export function createIdentityCallChain<T>(...functions: IdentityFn<T>[]): IdentityFn<T> {
  assertNotEmpty(functions, 'functions');
  return function chainCallRunner(value: T) {
    let result = value;

    functions.forEach(
      (fn, index) => {
        try {
          result = fn(result);
        } catch (ex: unknown) {
          throw new ExError(
            'An error occurred in the middle of an identity call chain.',
            {
              functions: functions.map(fn => fn.toString),
              errorAtName: fn.name,
              errorAtIndex: index, // in case same one is applied twice, or multiple are anonymous
            },
            ex
          );
        }
      }
    );

    return result;
  };
}
