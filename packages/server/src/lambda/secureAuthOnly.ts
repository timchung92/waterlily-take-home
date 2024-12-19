import {
  ApiExError,
  SessionType,
  httpStatusCodes,
  isNullOrUndefined,
} from '@shared';

export function secureAuthOnly({ session }: SessionProps) {
  if (
    isNullOrUndefined(session) ||
    session.sessionType === SessionType.unknown ||
    session.sessionType === SessionType.unauthenticated
  ) {
    throw new ApiExError(
      httpStatusCodes.unauthorized,
      'This route requires authentication.',
      { session }
    );
  }
}
