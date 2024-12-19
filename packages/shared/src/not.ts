export function not<
  TFunction extends (...args: any[]) => boolean,
  TParams extends Parameters<TFunction>
  >(fn: TFunction) {
  return function notImpl(...args: TParams) {
    return !fn(...args);
  }
}
