import * as inspector from 'inspector';

export function isDebuggerAttached() {
  return inspector.url() !== undefined;
}
