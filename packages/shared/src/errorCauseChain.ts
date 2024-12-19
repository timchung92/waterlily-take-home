import { hasOwnProperty } from './hasOwnProperty';

export function errorCauseChain(ex: unknown) {
  // we're going to loop through the cause chain recursively but want
  // to list everything oldest first. So we'll convert the
  // cause chain to an array and reverse it then build up the
  // loggabe object.

  const causeChain = [] as unknown[];
  let cause = ex;
  while (cause != undefined) {
    causeChain.push(cause);
    cause = hasOwnProperty(cause, 'cause') ? cause.cause : undefined;
  }

  return causeChain.reverse();
}
