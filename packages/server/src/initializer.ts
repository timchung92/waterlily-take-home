import {
  ExError,
  delayPromise,
  isNullUndefinedOrEmpty,
  logDebug,
  logError,
  logFatal,
} from '@shared';
import { EXIT_CODE_BAD_INITIALIZATION } from './util/serverConstants';

type Initializer = {
  fn: () => void,
  dependencies: (() => void)[];
};

const pendingInitializers = [] as Initializer[];
const runningInitializers = [] as Initializer[];
const completedInitializers = [] as Initializer[];

let initializerRunScheduled = false;
let initializerRunningPromise: Promise<void> | undefined = undefined;

function initializerToFnName(initializer: Initializer) {
  return initializer.fn.name;
}

export function registerInitializer(fn: () => void, ...dependencies: (() => void)[]) {

  if (isNullUndefinedOrEmpty(fn.name)) {
    const ex = new ExError(
      'Fatal development error. Attempted to register unnamed initialization function. Only named functions can be registered for initialization.',
      {
        fn: String(fn),
        dependencies: dependencies.map(dep => dep.name)
      }
    );

    logFatal(registerInitializer, ex.message, {}, ex);

    // delay exit to allow time for logging to finish. Some secondary errors may occur but that's less important.
    process.nextTick(() => {
      process.nextTick(() => {
        process.exit(EXIT_CODE_BAD_INITIALIZATION);
      });
    });
    return;
  }

  const isScheduledRunningOrRan = [
    pendingInitializers,
    runningInitializers,
    completedInitializers
  ].some(
    initializers => {
      initializers.some(
        i => i.fn === fn
      );
    }
  );

  if (isScheduledRunningOrRan) {
    // duplicate call to initialize, ok to ignore
    return;
  }

  pendingInitializers.push({ fn, dependencies });

  if (!initializerRunScheduled) {
    logDebug(
      registerInitializer,
      'Scheduling initializer',
      {
        pending: loggableInitializersMetadata(pendingInitializers),
        running: loggableInitializersMetadata(runningInitializers),
        completed: loggableInitializersMetadata(completedInitializers),
      });
    initializerRunScheduled = true
    process.nextTick(runInitializers);
  }
}

function loggableInitializersMetadata(initializers: Initializer[]) {
  return initializers.map(i => ({
    fn: i.fn.name,
    dependencies: i.dependencies.map(dep => dep.name)
  }));
}

export function runInitializers(): Promise<void> {
  const delayedPromise = delayPromise(runInitializersImpl);
  const ourPromise = delayedPromise.promise;
  delayedPromise.runNextTick();
  return ourPromise;

  function runInitializersImpl(resolve: () => void, reject: (ex: ExError) => void) {

    if (initializerRunningPromise) {
      initializerRunningPromise.then(resolve).catch(reject);
      return;
    }
    initializerRunScheduled = false;

    try {
      initializerRunningPromise = ourPromise;

      while (pendingInitializers.length) {
        runningInitializers.splice(
          runningInitializers.length, // should always be zero, but appending just in case
          0,
          ...pendingInitializers.splice(0, pendingInitializers.length)
        );

        sortInitializersByDependencies(runningInitializers);

        runningInitializers.forEach((initializer, index) => {
          const { fn } = initializer;
          try {
            fn();
            completedInitializers.push(initializer);
          } catch (ex) {
            const rethrow = new ExError(
              "Fatal error occurred running initializers and one threw an error. Lambda environment will be shut down.",
              {
                initializer: fn.name,
                index,
                initializersAlreadyRun: runningInitializers.slice(0, index).map(initializerToFnName),
                initializersRemaining: runningInitializers.slice(index + 1).map(initializerToFnName),
                pendingInitializers,
                completedInitializers,
              }
            );

            logFatal(runInitializers, ex.message, {}, rethrow);

            throw rethrow;
          }
        });
      }
      initializerRunningPromise = undefined;
      resolve();
    } catch (ex: unknown) {
      const message = 'Fatal error occurred running initializers, but not within a specific initializier.';
      const exError = ex instanceof ExError
        ? ex
        : new ExError(
          message,
          {
            runningInitializers: runningInitializers.map(initializerToFnName),
            pendingInitializers: pendingInitializers.map(initializerToFnName),
            completedInitializers: pendingInitializers.map(initializerToFnName),
          },
          ex
        );

      logFatal(runInitializers, message, {}, exError);

      initializerRunningPromise = undefined;
      reject(exError);
    } finally {
      if (initializerRunningPromise === ourPromise) {
        initializerRunningPromise = undefined;
      }
    }
  }

  function sortInitializersByDependencies(initializersToThisTime: Initializer[]) {
    const initializersToRunUnsorted = [ ...initializersToThisTime ];
    const initializersToRunSorted = [] as Initializer[];

    while (initializersToRunUnsorted.length) {
      const initializersToSortCountBeforeThisLoop = initializersToRunUnsorted.length;
      const initializersToSortThisLoop = initializersToRunUnsorted.splice(0, initializersToSortCountBeforeThisLoop);
      initializersToSortThisLoop.forEach(
        initializer => {
          const dependenciesMet = initializer.dependencies.length === 0 ||
            initializer.dependencies.every(
              checkingDependency =>
                initializersToRunSorted.some(
                  sortedInitializer => checkingDependency === sortedInitializer.fn
                ) ||
                completedInitializers.some(
                  completedInitializer => checkingDependency === completedInitializer.fn
                )
            );

          (dependenciesMet ? initializersToRunSorted : initializersToRunUnsorted)
            .push(initializer);
        }
      );

      if (initializersToRunUnsorted.length === initializersToSortCountBeforeThisLoop) {
        logError(
          runInitializers,
          "Likely-fatal development error occurred and initializers could not be sorted in dependency order. We'll continue but some will likely fail.",
          {
            initializersToSortCountBeforeThisLoop,
            initializersToSortThisLoop: initializersToSortThisLoop.map(i => i.fn.name),
            initializersToRunSorted: initializersToRunSorted.map(i => i.fn.name),
            initializersToRunUnsorted: initializersToRunUnsorted.map(i => i.fn.name)
          }
        );
        initializersToRunUnsorted.forEach(i => initializersToRunSorted.push(i));
        initializersToRunUnsorted.length = 0;
      }
    }

    initializersToThisTime.splice(0, initializersToThisTime.length, ...initializersToRunSorted);
  }
}
