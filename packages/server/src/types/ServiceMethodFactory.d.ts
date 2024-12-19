declare interface ServiceMethodFactory<TProps, TResult> {
  (): ServiceMethodDef<TProps, TResult>;
}