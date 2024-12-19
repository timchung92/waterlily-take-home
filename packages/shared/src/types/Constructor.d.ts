
declare interface Constructor<TArgs extends any[], TInstance> {
  new(...args: TArgs): TInstance;
}