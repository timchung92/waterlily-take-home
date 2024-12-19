import LogRocket from 'logrocket';
import { builtEnvironment } from '.';

export function logRocketInit() {
  const logRocketDevId = 'jih3es/dev-waterlily-app';
  const logRocketProdId = 'jih3es/prod-waterlily-app';
  const logRocketId =
    builtEnvironment === 'prod'
      ? logRocketProdId
      : builtEnvironment === 'dev'
        ? logRocketDevId
        : null;

  if (logRocketId) {
    LogRocket.init(logRocketId, {
      network: {
        responseSanitizer: response => {
          if (response.body?.includes('client')) {
            // checks if client is anywhere in the response.
            return {
              ...response,
              body: 'sanitized', // Removing the request body
              headers: {}, // Removing the headers
            };
          }
          return response;
        },
        requestSanitizer: request => {
          if (
            request.url.includes('policy-upload') ||
            request.url.includes('client')
          ) {
            // Sanitizing the request if 'policy-upload' is in the URL
            return {
              ...request,
              body: 'sanitized', // Removing the request body
              headers: {}, // Removing the headers
            };
          }
          return request;
        },
      },
    });
  }
}

export function logRocketIdentifyUser(
  advisorId: string,
  advisorFirstName: string,
) {
  LogRocket.identify(advisorId, {
    name: advisorFirstName,
    advisorId: advisorId,
  });
}
