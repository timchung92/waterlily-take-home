import { Action, AnyAction, Dispatch } from '@reduxjs/toolkit';
import {
  ActionCreatorWithPayload,
  PayloadAction,
} from '@reduxjs/toolkit/dist/createAction';
import { hasOwnProperty, SessionType } from '@shared';
import { isFunction, isString } from 'lodash';

import {
  ApiExError,
  builtEnvironment,
  doSafely,
  ExError,
  flattenObjects,
  HttpMethod,
  httpStatusCodes,
  isRunningLocal,
  isScalarLike,
  jsonParseBetter,
  jsonStringifyBetter,
  LogLevel,
  logMessage,
  logOnceLocal,
  randomUnambiguousString,
  regexReplaceWithBackreferences,
  replacePlaceholers,
  restSpecFromMethodName,
  toObjectMap,
} from '@shared';

import { createSimpleMiddleware } from './createSimpleMiddleware';
import { isLogAction } from './logTrackerModel';
import {
  selectMagicLinkSession,
  selectSession,
  selectVerifyPartnerLinkRequestState,
} from './selectors';
import { AppState } from './store';

// Warning! Circular imports; initially populated with placeholders.
// Do not access on first frame.
// Like to use * in future, but causes problems on prod build with circular reference
// and use-bef-re-initialized
//
// import * as allModelMethods from '.';

import { endApiAction, startApiAction } from './activeApiActionsModel';

type ActionCreatorMap = ObjectMap<ActionCreatorWithPayload<unknown>>;

type ActionMapping = {
  createRequest: ActionCreatorWithPayload<unknown>;
  createResponse: ActionCreatorWithPayload<unknown>;
  createFailure: ActionCreatorWithPayload<ApiExError>;
};

const apiActionTypeRequestSuffix = 'Request';
const apiActionTypeResponseSuffix = 'Response'; // wrong, should only be Success, but changing later
const apiActionTypeSuccessSuffix = 'Success';
const apiActionTypeFailureSuffix = 'Failure';

const apiActionTypeSuffixes = [
  apiActionTypeRequestSuffix,
  apiActionTypeResponseSuffix,
  apiActionTypeSuccessSuffix,
  apiActionTypeFailureSuffix,
];

const actionMap = {} as ObjectMap<ActionMapping>;
let actionMapPopulated = false;

const callsInProgress = {} as ObjectMap<Action<string>[]>;

function apiMiddlewareImpl(
  dispatch: Dispatch<AnyAction>,
  getStore: () => AppState,
  next: Dispatch<AnyAction>,
  action: Action<string>,
) {
  next(action);
  maybeInvokeServerCall(dispatch, getStore(), action);
}

async function maybeInvokeServerCall(
  dispatch: Dispatch<PayloadAction<unknown>>,
  state: AppState,
  action: PayloadAction<unknown> | Action<string>,
) {
  // ! IMPORTANT, we're async for easier programming, but we're called by non-async handler,
  // so we cannot throw an error or rely on on the promise we return ever being resolved.
  try {
    await popupateActionMap();

    const apiActionCreators = actionMap[action.type];
    if (apiActionCreators) {
      setTimeout(() =>
        invokeServerCall(dispatch, state, action, apiActionCreators),
      );
    }
  } catch (ex: unknown) {
    // if an error happened here, it was during population or access of the action map,
    // truly fatal and we can't log messages to server
    console.error(
      `Fatal dev error populating and accessing action map: ${(ex as Error).stack ?? ex}`,
    );
  }
}

async function invokeServerCall(
  dispatch: Dispatch<PayloadAction<unknown>>,
  state: AppState,
  action: PayloadAction<unknown> | Action<string>,
  apiActionCreators: ActionMapping,
) {
  // pre-declaring variables so they can be included in error messages
  let requestFnName: string | undefined = undefined;
  let restSpec: RestSpec | undefined = undefined;
  let populatedPath: string | undefined = undefined;
  let origin: string | undefined = undefined;
  let env: string | undefined = undefined;
  let href: string | undefined = undefined;

  try {
    const logging = isLogAction(action);

    const { cognitoSession, sessionType } = selectSession(state);
    const { token: magicLinkToken } = selectMagicLinkSession(state);
    const { dbRecord } = selectVerifyPartnerLinkRequestState(state);
    const verifyPartnerLinkToken = dbRecord?.token;
    // if (cognitoSession === null) {
    //   // We can't make server calls, not even to log messages.
    //   // We need global error handling with user notification to handle this properly...

    //   // bug if this is just a log call, then we'll ignore it (might want to queue in future).
    //   if (logging) {
    //     return;
    //   }

    //   // redirect to login, but we can't use regular navigation since we're not in a React component,
    //   // and due to critical error we shoudl force reload anyways. `cb` refers to "cache buster".
    //   document.location.replace(`/?cb=${ Date.now().valueOf().toString(36) }`);
    //   return;
    // }

    requestFnName = requestTypeToTypeRoot(action.type);
    restSpec = restSpecFromMethodName(requestFnName);
    if (restSpec === undefined) {
      // not actually a service method; possibly from a library
      return;
    }

    populatedPath = populatePathSpecProps(action, restSpec);
    origin = new URL(document.URL).origin;
    env = isRunningLocal() ? 'dev' : builtEnvironment;
    href = `${origin}/${env}/api${populatedPath}`;

    const logSpecificOptions = logging
      ? ({
          keepalive: true,
          priority: 'low',
        } as RequestInit)
      : undefined;

    const authHeader =
      sessionType === SessionType.client
        ? {
            Authorization: `Bearer ${magicLinkToken ?? verifyPartnerLinkToken}`,
          }
        : cognitoSession
          ? {
              Authorization: `Bearer ${cognitoSession.idToken.jwtToken}`,
            }
          : undefined;

    const requestInit: RequestInit = {
      ...logSpecificOptions,
      method: restSpec.httpMethod,
      headers: new Headers({
        ...authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CloudFront-Dont-Cache-Me': randomUnambiguousString(8),
      }),
      body:
        (restSpec.httpMethod === HttpMethod.POST ||
          restSpec.httpMethod === HttpMethod.PUT ||
          restSpec.httpMethod === HttpMethod.DELETE) &&
        hasOwnProperty(action, 'payload')
          ? jsonStringifyBetter(action.payload)
          : null,
      redirect: 'error',
    };

    // api actions are usually dispatched from effects and effects with multiple dependencies can get
    // triggered several times whe a component is created. We only want to dispatch the API call once
    // so we serialize the entire request, including all params and body, and use that to track
    // unique requests that are in-progress.
    //
    // Unlike activeApiActions, this tracks the serialized form of the request and not the individual
    // dispatched actions.
    const callTrackingKey = JSON.stringify({ href, requestInit });
    let existingActionsForThisCall = callsInProgress[callTrackingKey];
    if (existingActionsForThisCall) {
      existingActionsForThisCall.push(action);
      return;
    }
    callsInProgress[callTrackingKey] = existingActionsForThisCall = [action];
    dispatch(startApiAction(action));

    let rawResponse: Response;
    try {
      rawResponse = await fetch(href, requestInit);

      if (rawResponse.ok) {
        const bodyText = await rawResponse.text();
        const response = jsonParseBetter(bodyText);
        const responseAction = apiActionCreators.createResponse(response);
        setTimeout(() => {
          dispatch(responseAction);
          existingActionsForThisCall.forEach(otherAction =>
            dispatch(endApiAction(otherAction)),
          );
        });
        return;
      }
    } finally {
      delete callsInProgress[callTrackingKey];
    }

    const { headers, redirected, statusText, type, url } = rawResponse;

    const body =
      headers.get('content-length') === '0'
        ? undefined
        : {
            body:
              (await doSafely(
                async () => await rawResponse.json(),
                undefined,
              )) ??
              (await doSafely(
                async () => await rawResponse.text(),
                undefined,
              )) ??
              'ERROR GETTING BODY AS JSON OR TEXT',
          };

    processError(
      new ApiExError(
        rawResponse.status.toString(),
        'Error invoking remote API method.',
        {
          response: {
            ...body,
            headers: [...headers.keys()].reduce(
              (map, name) => {
                map[name] = headers.get(name);
                return map;
              },
              {} as ObjectMap<string | null>,
            ),
            redirected,
            statusText,
            type,
            url,
          },
        },
      ),
    );
  } catch (ex: unknown) {
    processError(ex);
  }

  function processError(ex: unknown) {
    if (isLogAction(action)) {
      logOnceLocal(
        invokeServerCall,
        'Error sending logs to server.',
        { action },
        ex,
      );
      return;
    }

    const metadata = {
      href,
      populatedPath,
      action,
      requestFnName,
      restSpec,
      origin,
      apiActionCreators: Object.values(apiActionCreators).map(ac => ac.type),
    };

    const apiEx =
      ex instanceof ApiExError
        ? ex.addMetadata(metadata)
        : new ApiExError(
            httpStatusCodes.clientSideError,
            'Error invoking remote API method.',
            metadata,
            ex,
          );

    logMessage({
      time: new Date(),
      level: LogLevel.error,
      source: apiMiddlewareImpl,
      staticMessage: hasOwnProperty(ex, 'message')
        ? (ex.message as string)
        : apiEx.message,
      metadata: {},
      error: apiEx,
    });

    setTimeout(() => {
      dispatch(apiActionCreators.createFailure(apiEx));
    });
  }
}

async function popupateActionMap() {
  if (actionMapPopulated) {
    return;
  }

  const allModelMethods = await import('.');
  const actionsCreators = allModelMethods as unknown as ActionCreatorMap; // typing not exactly true, but is for the ones we care about

  const map = toObjectMap(
    Object.values(actionsCreators).filter(
      fn =>
        isFunction(fn) && hasOwnProperty(fn, 'type') && isApiRequestAction(fn),
    ),
    fn => fn.type,
    createRequest => {
      const root = requestTypeToTypeRoot(createRequest.type);
      const responseName = `${root}Response`;
      const failureName = `${root}Failure`;
      return {
        createRequest,
        createResponse: actionsCreators[responseName],
        createFailure: actionsCreators[failureName],
      } as ActionMapping;
    },
  );

  Object.assign(actionMap, map);
}

function requestTypeToTypeRoot(requestType: string) {
  return regexReplaceWithBackreferences(requestType, /^.+\/(\w+)Request/);
}

function populatePathSpecProps(
  action: PayloadAction<unknown> | Action<string>,
  restSpec: RestSpec,
) {
  const { pathSpec, propNames } = restSpec;
  const { payload } = action as PayloadAction<unknown>;

  if (payload === undefined) {
    if (propNames.length === 0) {
      return pathSpec;
    }
    throw new ExError(
      'Development error occurred; API action invoked wihout props but the path spec specified some.',
      {
        ...restSpec,
        action,
      },
    );
  }

  let props: ObjectMap<unknown>;

  if (isScalarLike(payload)) {
    if (propNames.length !== 1) {
      throw new ExError(
        "Development error occurred; API action invoked with a scalar payload but the path spec didn't specify exactly one prop.",
        {
          ...restSpec,
          action,
        },
      );
    }
    props = { [propNames[0]]: payload };
  } else if (payload === null) {
    // valid value for posts, but cannot populate path spec with placeholders
    props = {};
  } else {
    props = flattenObjects(payload);
  }

  const missingPathSpecProps = propNames.filter(
    propName => !hasOwnProperty(props, propName),
  );
  if (missingPathSpecProps.length) {
    throw new ExError(
      'Development error occurred; API action missing required props from the payload.',
      {
        ...restSpec,
        action,
        props,
      },
    );
  }

  // there can be extras; posts expecially will have them

  return replacePlaceholers(pathSpec, props, ':', '');
}

export const apiMiddleware = createSimpleMiddleware(apiMiddlewareImpl);

export function isApiAction(action: Action<string>) {
  const { type } = action;
  return apiActionTypeSuffixes.some(suffix => type.endsWith(suffix));
}

export function isApiRequestAction({ type }: Action<string>) {
  return isString(type) && type.endsWith(apiActionTypeRequestSuffix);
}

export function isApiSuccessiAction({ type }: Action<string>) {
  return (
    type.endsWith(apiActionTypeResponseSuffix) ||
    type.endsWith(apiActionTypeSuccessSuffix)
  );
}

export function isApiFailureAction({ type }: Action<string>) {
  return type.endsWith(apiActionTypeFailureSuffix);
}
