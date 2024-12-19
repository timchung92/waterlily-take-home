import {
  ApiExError,
  httpStatusCodes,
  isRunningLocal,
} from '@shared';

export function secureLocalOnly(_props: unknown) {
  if (!isRunningLocal()) {
    throw new ApiExError(
      httpStatusCodes.methodNotAllowed, // see explanation in routeCall
      'URL is not accessible outside of local development.',
      {}
    );
  }
}
