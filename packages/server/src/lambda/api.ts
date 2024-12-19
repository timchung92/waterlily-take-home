import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";

import type {
  Context as LambdaContext,
  APIGatewayProxyEvent
} from "aws-lambda";
import { routeCall } from './routeCall';
import {
  ApiExError,
  createLogCode,
  ExError,
  fastMaybeParseDateString,
  httpStatusCodes,
  isRunningLocal,
  isNullUndefinedOrEmpty,
  jsonStringifyBetter,
  logError,
  logFatal,
  recurseObject,
  ContentType,
} from '@shared';
import { runInitializers } from '..';
import { handleCloudFormationValidation } from './handleCloudFormationValidation';

// const apiGatewayProxyEventLoggableProps = new RegExp(
//   [
//     '^\.(',
//     [
//       /path/,
//       /httpmethod/,
//       /headers\.host/,
//       /headers\.content-length/,
//       /headers\.traceparent/,
//       /headers\.user-agent/,
//       /headers\.via/,
//       /headers\.x-amz-cf-id/,
//       /headers\.x-amzn-trace-id/,
//       /querystringparameters/,
//       /requestcontext\.resourceid/,
//       /requestcontext\.extendedrequestid/,
//       /requestcontext\.requesttime/,
//       /requestcontext\.path/,
//       /requestcontext\.accountid/,
//       /requestcontext\.stage/,
//       /requestcontext\.requestid/,
//       /body.*/,
//     ]
//       .map(r => r.source)
//       .join('|'),
//     ')'
//   ].join('')
// );

// console.log({ apiGatewayProxyEventLoggableProps });
// const apiGatewayProxyEventLogCustomizer: ClonePlusCustomizer =
//   function apiGatewayProxyEventLogCustomizerImpl(
//     value: any,
//     _key: unknown,
//     _parent: any,
//     _foundObjects: Map<unknown, unknown>,
//     pathKeys: string
//   ) {
//     console.log(`apiGatewayProxyEventLogCustomizer(...'${ pathKeys }')`);
//     return pathKeys === '' || apiGatewayProxyEventLoggableProps.test(pathKeys)
//       ? value
//       : suppressKeyValuePair

//   };

async function rawHandler(
  event: APIGatewayProxyEvent,
  context: LambdaContext,
) {

  let response: any = {
    statusCode: 500,
    body: JSON.stringify(
      {
        error: 'There was an error processing the request. It has been logged and our support team notified for investigation.'
      }
    )
  };

  try {

    // Too many troubles making TypeScript ESM support with Serverless,
    // almost there but not quite, Serverless team still working on some quirks.
    // So at this point the initializers should have already kicked off and maybe even
    // run, but likely not finished running. This call will cause us to wait for them
    // to finish, even if they are already in progress, and is basically a noop if they
    // are already finished.
    await runInitializers();

    const cloudformationValidationResponse = await handleCloudFormationValidation(event, context);
    if (cloudformationValidationResponse !== null) {
      return cloudformationValidationResponse;
    }

    recurseObject(
      event.body,
      (value, key: any, parent) => {
        const updated = fastMaybeParseDateString(value);
        if (updated !== value) {
          parent[ key ] = updated;
        }
      }
    );

    const result = await routeCall(event);

    // return pdf response
    if (event.headers.accept === ContentType.PDF || event.headers.Accept === ContentType.PDF) {
      response = {
        statusCode: 200,
        headers: {
          'Content-Type': ContentType.PDF,
        },
        body: result,
        isBase64Encoded: true
      };
      // return redirect response
    } else if (result && (result as any).shouldRedirect && (result as any).redirectUrl) {
      response = {
        statusCode: 302,
        headers: {
          Location: (result as any).redirectUrl
        }
      };
      // return json response
    } else {
    response.statusCode = Number.parseInt(httpStatusCodes.ok);
    response.body = JSON.stringify(result, undefined, 2); // jsonStringifyBetter(result);
    }

  } catch (ex: unknown) {

    try {

      response.statusCode = Number.parseInt(httpStatusCodes.internalServerError);
      let safeUserMessage = undefined as string | undefined;

      let logCode = '';
      let exLog: ExError | undefined = undefined;

      if (ex instanceof ExError) {

        // const smallerEvent = clonePlus(
        //   event,
        //   {
        //     customizer: apiGatewayProxyEventLogCustomizer
        //   }
        // );

        // console.log(
        //   '--    ' +
        //   jsonStringifyBetter(
        //     { event, smallerEvent }
        //   ).split('\n').join('\n--    ')
        // );

        ex.addMetadata(
          {
            event: {
              path: event.path,
              httpMethod: event.httpMethod,
              headers: {
                host: event.headers.host,
                'content-length': event.headers[ 'content-length' ],
                traceparent: event.headers.traceparent,
                useragent: event.headers[ 'user-agent' ],
                via: event.headers.via,
                'x-amz-cf-id': event.headers[ 'x-amz-cf-id' ],
                'x-amzn-trace-id': event.headers[ 'x-amzn-trace-id' ],
              },
              queryStringParameters: event.queryStringParameters,
              requestContext: {
                resourceId: event.requestContext.resourceId,
                extendedRequestId: event.requestContext.extendedRequestId,
                requestTime: event.requestContext.requestTime,
                path: event.requestContext.path,
                accountId: event.requestContext.accountId,
                stage: event.requestContext.stage,
                requestId: event.requestContext.requestId,
              },
              body: event.body,
            }
          }
        );

        if (isNullUndefinedOrEmpty(ex.logCode)) {
          logCode = ex.logCode = createLogCode();
          exLog = ex;
        }

        if (ex instanceof ApiExError) {
          response.statusCode = Number.parseInt(ex.statusCode);

          if (ex.statusCode.startsWith('4')) {
            safeUserMessage = ex.staticMessage;

            if (ex.statusCode === httpStatusCodes.notFound || ex.statusCode === httpStatusCodes.forbidden) {
              // Never send 403 or 404 back from API
              // see comment in routeCall
              response.statusCode = Number.parseInt(httpStatusCodes.methodNotAllowed)
            }
          }
        }
      } else {
        logCode = createLogCode();
        exLog = new ApiExError(
          httpStatusCodes.internalServerError,
          'Unhandled error caught at API entrypoint.',
          { event },
          ex
        );
      }

      const userMessageStart = safeUserMessage
        ? `${ safeUserMessage }. The error`
        : 'A server error occurred and';
      const userMessage =
        `${ userMessageStart } has been logged as ${ logCode }. If the problem persists please contact support and provide this code to them.`;

      if (exLog) {

        if (isRunningLocal()) {
          console.error(exLog.toString());
        } else {
          logError(
            rawHandler,
            'A server error occurred and logCode was provided to the user.',
            {
              logCode,
              userMessage
            },
            exLog
          );
        }
      }

      response.body = jsonStringifyBetter(
        {
          errorMessage: userMessage,
          ...(
            isRunningLocal()
              ? { error: exLog?.toLoggableObject() ?? ex }
              : undefined
          )
        }
      );

    } catch (ex2: unknown) {
      // our error handler caused an error; very bad
      logFatal(
        rawHandler,
        'Error handler in the API entry point caused an error of its own.',
        {
          firstError: ex,
          event
        },
        ex2
      );
    }
  } finally {
    return response;
  }
};

export const handler = middy(rawHandler).use(middyJsonBodyParser());

