import { isWizard } from './isWizard';

export enum SessionType {
  unknown,
  unauthenticated,
  advisor,
  client,
  wizard, // Waterlily Support & Developers
  scheduledEvent, // Scheduled events from event bridge that use api key
  advisorMissingConsents,
}

/**
 * Returns the appropriate session type for a given user. "User" since in the future
 * we'll have other user types even though right now all are advisor-based.
 */
export function sessionTypeForUser(advisor: Advisor) {
  return isWizard(advisor) ? SessionType.wizard : SessionType.advisor;
}
