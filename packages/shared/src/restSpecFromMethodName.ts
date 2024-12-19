import { camelCase, kebabCase } from 'lodash';
import { first } from './first';
import { HttpMethod } from './HttpMethod';
import { ServiceAction } from './ServiceAction';

const serviceActionToHttpMethodList = Object.entries({
  [ServiceAction.fetch]: HttpMethod.GET,
  [ServiceAction.post]: HttpMethod.POST,
  [ServiceAction.put]: HttpMethod.PUT,
  [ServiceAction.delete]: HttpMethod.DELETE,
  [ServiceAction.run]: HttpMethod.POST,
});

const methodNamePartSplitRegex = /(By|For)(?=[A-Z])/;

export function restSpecFromMethodName(methodName: string): RestSpec | undefined {
  const serviceActionAndHttpMethod = first(
    serviceActionToHttpMethodList,
    ([serviceAction]) => methodName.startsWith(serviceAction),
  );

  if (serviceActionAndHttpMethod === undefined) {
    return undefined; // not a service method
  }

  const [serviceAction, httpMethod] = serviceActionAndHttpMethod;
  const methodNameParts = methodName.substring(serviceAction.length).split(methodNamePartSplitRegex);

  const propsIntegrated = [] as string[];
  const pathSpecSegments = [] as string[];
  const propNames = [] as string[];

  // first pass is to combine props and their corresponding segments
  for (let i = 0; i < methodNameParts.length; i++) {
    const part = methodNameParts[i];

    if (i >= methodNameParts.length - 2 || methodNameParts[i + 1] !== 'By') {
      propsIntegrated.push(kebabCase(part));
      continue;
    }

    const propName = camelCase(methodNameParts[i + 2]);
    propNames.push(propName);
    propsIntegrated.push(`${kebabCase(part)}/:${propName}`);
    i += 2;
  }

  // now put in proper order based on 'for', which is now in kebab-case, so lowercase 'for'
  let nextIsPrepend = false; // `For` triggers prepending, so `fetchSurveyForClient` translates to `/client/survey`
  for (let i = 0; i < propsIntegrated.length; i++) {
    const part = propsIntegrated[i];

    if (part === 'for') {
      nextIsPrepend = true;
      continue;
    }
    if (nextIsPrepend) {
      pathSpecSegments.unshift(part);
    } else {
      pathSpecSegments.push(part);
    }
    nextIsPrepend = false;
  }

  const pathSpec = `/${ pathSpecSegments.join('/') }`;

  return {
    methodName,
    httpMethod,
    pathSpec,
    propNames,
    serviceAction,
  };
}
