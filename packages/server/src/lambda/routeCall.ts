// Sam: I'm not sure what's wrong with the path-match typings I wrote up, but it requires
// a reference to work. Ideally can be fixed some time.
/// <reference path="../../../shared/src/types/path-match.d.ts" />

import { groupBy, isFunction } from 'lodash';
import { match } from 'path-to-regexp';
import { performance } from 'perf_hooks';

import {
  ApiExError,
  createLogCode,
  ExError,
  httpStatusCodes,
  isDefined,
  isNullOrUndefined,
  logDebug,
  logError,
  logInfo,
  mapFirst,
  randomUnambiguousString,
  restSpecFromMethodName,
  stripStart,
  toObjectMap,
} from '@shared';

import { maybeLoadSession } from './maybeLoadSession';
import { secureAuthOnly } from './secureAuthOnly';
import { secureLocalOnly } from './secureLocalOnly';
import { secureWizardOnly } from './secureWizardOnly';

import * as services from '../services';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { secureScheduledEventsOnly } from './secureScheduledEventsOnly';

interface ServiceMethodDef<TProps, TReturn> extends RestSpec {
  routeMatcher: PathMatcher<TProps>,
  serviceMethod: ServiceMethod<TProps, TReturn>;
};

type ServiceCall<TProps, TReturn> = ServiceMethodDef<TProps, TReturn> & {
  props: TProps;
};

function createRoute(pathSpec: string) {
  const matchRoute = match(pathSpec, { decode: decodeURIComponent });
  return (path: string) => {
    const result = matchRoute(path);
    return result ? result.params : false;
  };
}
const routes = (Object.values(services) as ServiceMethod<PathMatchParamsMap, unknown>[])
  .map(createServiceMethodDef)
  .filter(isDefined);

const routesByHttpMethod = groupBy(routes, route => route.httpMethod);

process.nextTick(function logRoutesAtStartup() {
  logDebug(
    logRoutesAtStartup,
    "Initialized server routes.",
    {
      routes: routes.map(
        ({ methodName, httpMethod, pathSpec, propNames }) =>
          `${httpMethod} ${pathSpec}  ->  ${methodName}(${ propNames.join(', ') })`
      )
    }
  );
});

export async function routeCall({
  httpMethod,
  path,
  queryStringParameters,
  headers: mixedCaseHeaders,
  body,
}: APIGatewayProxyEvent) {

  const startTime = performance.now();
  const apiPath = stripStart(path, '/api')
  const route = findRoute(httpMethod, apiPath);

  const {
    pathSpec,
    propNames,
    props,
    serviceAction,
    serviceMethod,
    methodName
  } = route;

  const headers = toObjectMap(
    Object.entries(mixedCaseHeaders),
    ([ name, _value ]) => name.toLowerCase(),
    ([ _name, value ]) => value,
  );

  const session = await maybeLoadSession({ headers });
  const logTraceId = `${ randomUnambiguousString(4) }_${ randomUnambiguousString(5) }`;

  const logMetadata = {
    logTraceId,
    httpMethod,
    path,
    pathSpec,
    methodName,
    sessionType: session.sessionType,
    advisorId: session.advisor?.advisorId ?? null,
  };

  logInfo(routeCall.name, 'Routing HTTP call', logMetadata);

  const fullProps = {
    ...props,
    ...(isNullOrUndefined(body) ? undefined : { body }),
    headers,
    session,
    methodName,
    httpMethod,
    pathSpec,
    queryStringParameters: queryStringParameters ?? ({} as ObjectMap<string>),
    propNames,
    serviceAction,
  } as StandardProps;

  const result = await serviceMethod(fullProps);
  const elapsedTime = Math.ceil(performance.now() - startTime);

  logInfo(
    routeCall.name,
    'Finished routing HTTP call',
    {
      elapsedTime,
      ...logMetadata,
    }
  );

  return result;
}

function findRoute(httpMethod: string, path: string) {
  const routesForHttpMethod = routesByHttpMethod[ httpMethod ];
  const route = mapFirst(
    routesForHttpMethod,
    route => {
      const props = route.routeMatcher(path);
      if (props === false) {
        return null;
      }
      return {
        ...route,
        props
      } as ServiceCall<PathMatchParamsMap, unknown>;
    }
  );

  if (route === null) {
    throw new ApiExError(

      // Responding with HTTP 405 Method Not Allowed
      //
      // Technically this is a 404 since the url doesn't exist, but 4xx errors are client errors
      // and while this is a client error, it's an error in the programming of our client, not
      // a user error.
      //
      // It's not a server error though, so 5xx are not really appropriate either.
      //
      // Sending 405 instead of 404 because CloudFront is configured to respond to all 404 errors
      // with the default index.html page since that is required to support single-page-apps with
      // client-side routing. Doing that here though will cause errors in the client since the
      // client is expecting JSON back and not HTML.
      //
      httpStatusCodes.methodNotAllowed,
      'No route was found matching the provided path.',
      {
        httpMethod,
        path,
        routesDefined: routes.map(
          ({ httpMethod, pathSpec, methodName }) => ({ httpMethod, pathSpec, methodName })
        )
      }
    );
  }

  return route;
}

function createServiceMethodDef<TProps, TReturn>(serviceMethod: ServiceMethod<TProps, TReturn>, index: number) {

  let callChain = serviceMethod;

  try {

    if (!isFunction(serviceMethod)) {
      return undefined;
    }

    const serviceMethodName = serviceMethod.name;
    const restSpec = restSpecFromMethodName(serviceMethodName)
    if (!restSpec) {
      return undefined; // not a service method
    }

    const { pathSpec } = restSpec;

    const routeMatcher = createRoute(pathSpec);

    maybeAppendCallChain(
      !pathSpec.includes('/auth/') && !pathSpec.includes('/public/') && !pathSpec.includes('/scheduled-events/'),
      secureAuthOnly
    );
    maybeAppendCallChain(
      pathSpec.includes('/local/'),
      secureLocalOnly
    );

    maybeAppendCallChain(
      pathSpec.includes('/wizard/'),
      secureWizardOnly
    );

    maybeAppendCallChain(
      pathSpec.includes('/scheduled-events/'),
      secureScheduledEventsOnly
    )

    return {
      ...restSpec,
      routeMatcher,
      serviceMethod: callChain,
    } as ServiceMethodDef<TProps, TReturn>;
  } catch (ex: unknown) {
    const toThrow = new ExError(
      'Fatal error occurred initialziing routes from service method names.',
      {
        serviceMethod,
        index
      },
      ex
    );

    toThrow.logCode = createLogCode();
    logError(createServiceMethodDef, toThrow.message, toThrow.metadata, ex);
    throw toThrow;
  }

  function maybeAppendCallChain<TProps, TReturn>(condition: boolean, fn: ServiceMethod<TProps, TReturn>) {
    if (!condition) {
      return;
    }
    const priorCallChain = callChain;
    callChain = props => {
      fn(props);
      return priorCallChain(props);
    }
  }
}