import { maybeGet } from './maybeGet';

export const runningEnvironment = {
  local: false,
  integrationTest: false,
  unitTest: false,
  endToEndTest: false,
  dev: false,
  demo: false,
  stage: false,
  prod: false,
};

export function isRunningLocal() {
  return runningEnvironment.local;
}

export function isRunningIntegrationTest() {
  return runningEnvironment.integrationTest;
}

export function isRunningUnitTest() {
  return runningEnvironment.unitTest;
}

export function isRunningEndToEndTest() {
  return runningEnvironment.endToEndTest;
}

export function isRunningDev() {
  return runningEnvironment.dev;
}

export function isRunningDemo() {
  return runningEnvironment.demo;
}

export function isRunningStage() {
  return runningEnvironment.stage;
}

export function isRunningProd() {
  return runningEnvironment.prod;
}

export function useLocalAuthBypass() {
  return (
    isRunningLocal() &&
    typeof document === 'object' &&
    document?.location?.search?.includes('real-auth') === false
  );
}

// in shared we don't normally want to access anything browser-specific, but since this is
// an idempotent function and the access is conditional we're safe to do so.
declare const document: {
  URL: string;
  location?: {
    search?: string;
  };
};

/**
 * Tests if running in local development for displaying of additional information useful during development.
 */
function checkIsRunningLocal() {
  const localServerless = maybeGet(
    () => process.env.IS_OFFLINE === 'true' && process.platform === 'darwin',
  );
  const localBrowser = maybeGet(() =>
    typeof document === 'object'
      ? /^https?:\/\/localhost(:\d+)?($|\/)/.test(document.URL)
      : undefined,
  );
  return Boolean(localServerless || localBrowser);
}

function initializeRunningEnvironment() {
  try {
    if (checkIsRunningLocal()) {
      runningEnvironment.local = true;
    }

    if (new Error().stack?.includes('at VitestExecutor')) {
      runningEnvironment.unitTest = true;
    }
  } catch (ex) {
    console.error(
      `Fatal error initializing running environment.\n\n${typeof ex === 'object' && ex !== null && 'stack' in ex ? ex.stack : String(ex)}`,
    );
  }
}
initializeRunningEnvironment();
