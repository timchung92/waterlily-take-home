import { ParseableToFullName, parseFullName } from './parseFullName';

/**
 * Given an object with one of the first/last name fields supported or two strings of first and last names, returns the
 * initials; first character of each concatenated together. Handles either or both of the names missing.
 */
export function initials(advisor: Advisor): string;
export function initials(client: Client): string;
export function initials(session: Session): string;
export function initials(
  firstName: string | undefined,
  lastName: string | undefined,
): string;
export function initials(...args: ParseableToFullName): string {
  const [firstName, lastName] = parseFullName(...args);
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`;
}
