
declare interface ServiceMethod<TProps, TResult> {
  (props: StandardProps<TProps>): TResult;
}
