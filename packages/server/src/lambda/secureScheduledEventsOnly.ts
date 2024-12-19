import {
  ApiExError,
  SessionType,
  httpStatusCodes,
  isNullOrUndefined,
} from '@shared';

export function secureScheduledEventsOnly({ session }: SessionProps) {
  if (
    isNullOrUndefined(session) ||
    session.sessionType !== SessionType.scheduledEvent
  ) {
    throw new ApiExError(
      httpStatusCodes.unauthorized,
      'This route is only available to scheduled events.',
      { session }
    );
  }
}
