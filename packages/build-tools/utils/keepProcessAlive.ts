import { isFunction } from 'lodash';

export const MAX_SAFE_32_BIT_INTEGER = 2147483647;

export function keepProcessAlive(main: Promise<void> | (() => Promise<void>), timeout: number = MAX_SAFE_32_BIT_INTEGER)  {
  const promise = isFunction(main) ? main() : main;
  const timer = setTimeout(promiseTimedOut, timeout);

  promise
    .then(() => {
      clearInterval(timer);
    })
    .catch(reason => {
      console.error('stack' in reason ? reason.stack : reason);
      setTimeout(() => process.exit(), 50);
    });

  function promiseTimedOut() {
    console.error('Promise timed out; allowing process to exit.');
  }
}
