
export type PromiseExecutor<T> = (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void;
export type PromiseResolver<T> = Parameters<PromiseExecutor<T>>[ 0 ];
export type PromiseRejector = Parameters<PromiseExecutor<unknown>>[ 1 ];

export function delayPromise<T = void>(executor: PromiseExecutor<T>) {
  return new DelayedPromise(executor);
}

export class DelayedPromise<T> {
  public promise: Promise<T>;
  public resolve!: PromiseResolver<T>;
  public reject!: PromiseRejector;

  constructor(private executor: PromiseExecutor<T>) {
    this.promise = new Promise((resolve: PromiseResolver<T>, reject: PromiseRejector) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  public run() {
    try {
      this.executor(this.resolve, this.reject);
    } catch (ex: unknown) {
      this.reject(ex);
    }
  }

  public runNextTick() {
    setTimeout(this.run.bind(this));
  }
}
