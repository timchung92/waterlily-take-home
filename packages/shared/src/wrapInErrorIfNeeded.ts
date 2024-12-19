/**
 * Ensures the passed in error is actually an error, and wraps it in an error if it isn't.
 */
export function wrapInErrorIfNeeded(ex: unknown): Error {
  return ex instanceof Error
    ? ex
    : new Error(String(ex));
}
