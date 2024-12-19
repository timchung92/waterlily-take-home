
declare interface StandardProps<TProps = ObjectMap<unknown>> extends
  TProps,
  Partial<BodyProps>,
  QueryStringParametersProps,
  HeadersProps,
  SessionProps,
  RestSpec
{ }
