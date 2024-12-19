import { isRunningLocal } from './isRunningEnvironment';

/**
 * Wrapper for JSON.stringify() with improved error handling,
 * custom handling for some types, and automatic pretty formatting
 * for local development.
 */
export function jsonStringifyBetter(value: unknown): string {
  return JSON.stringify(
    value,
    undefined,
    isRunningLocal() ? 2 : undefined
  );
}
