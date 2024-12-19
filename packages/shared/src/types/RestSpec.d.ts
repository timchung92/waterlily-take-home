declare interface RestSpec {
  methodName: string;
  httpMethod: HttpMethod;
  pathSpec: string;
  propNames: string[];
  serviceAction: ServiceAction;
}