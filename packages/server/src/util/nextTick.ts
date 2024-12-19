export function nextTick<T = void>(fn?: () => T): Promise<T> {
  return new Promise(nextTickImpl);

  function nextTickImpl(resolve: (result: T) => void, reject: (error: Error) => void) {
    process.nextTick(() => {
      try {
        resolve(fn?.());
      } catch (ex) {
        reject(ex);
      }
    });
  }
}
