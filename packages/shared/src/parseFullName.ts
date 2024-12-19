import { isNullOrUndefined } from './isNullOrUndefined';

export type ParseableToFullName =
  | [Advisor | Client | Session | Survey | null ]
  | [string | undefined, string | undefined];

/**
 * Given an object with one of the first/last name fields supported or two strings of first and last names, returns
 * a two-element array with first and last name and guarantee that both are present and strings, but may be empty
 * strings. Handles either or both of the names missing.
 */
export function parseFullName(advisor: Advisor): [string, string];
export function parseFullName(client: Client): [ string, string ];
export function parseFullName(session: Session): [string, string];
export function parseFullName(survey: IntakeSurvey): [string, string];
export function parseFullName(
  firstName: string | undefined,
  lastName: string | undefined,
): [ string, string ];
export function parseFullName(...args: ParseableToFullName): [string, string];
export function parseFullName(...args: ParseableToFullName): [ string, string ] {
  if (args.length === 1) {
    const [arg] = args;
    if (isNullOrUndefined(arg)) {
      return [ '', '' ];
    }
    if (typeof arg === 'string') {
      return [arg, ''];
    }
    if (typeof arg === 'object') {
      const {
        advisorFirstName,
        advisorLastName,
        clientFirstName,
        clientLastName,
        partnerFirstName,
        partnerLastName,
      } = ((arg as Session).advisor ?? arg) as Client & Advisor & IntakeSurvey;
      return [
        advisorFirstName ?? clientFirstName ?? partnerFirstName ?? '',
        advisorLastName ?? clientLastName ?? partnerLastName ?? '',
      ];
    }
  }
  if (args.length === 2) {
    const [firstName, lastName] = args as (string | undefined)[];
    return [firstName ?? '', lastName ?? ''];
  }
  return ['', ''];
}