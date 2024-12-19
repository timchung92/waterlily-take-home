export async function doSafely<T>(
  dangerousAction: () => T | Promise<T>,
  valueOnError?: T,
) {
  try {
    return await dangerousAction();
  } catch {
    return valueOnError;
  }
}
