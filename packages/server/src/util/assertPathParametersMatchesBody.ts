import {
  ApiExError,
  httpStatusCodes,
  mapFirst,
} from '@shared';

export function assertPathParametersMatchesBody<T>(
  pathParameters: Partial<T>,
  body: T
) {
  const mismatch = mapFirst(
    Object.entries(pathParameters),
    ([ pathKey, pathValue ]) =>
      pathValue === body[ pathKey ]
        ? null
        : { [ pathKey ]: pathValue }
  );

  if (mismatch === null) {
    return;
  }

  throw new ApiExError(
    httpStatusCodes.badRequest,
    'Invalid request; path parameter value does not match body value for same parameter.',
    {
      mismatch,
      pathParameters,
      body,
    }
  );
}
