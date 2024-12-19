import { AssertionError } from 'assert';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  logDebug,
  logError,
  logFatal,
  logInfo,
  logLocal,
  LogLevel,
  logMessage,
  logWarn,
  createLogCode,
  jsonStringifyBetter,
  yamlParse,
  logLevelConsoleMethodMap,
  isDefined,
  cleanCodePaths,
  LogMessage,
  overrideLogTimeProvider,
} from '@shared';
import { mockRandom } from './testUtils';
import { isError, isString } from 'lodash';

const logTime = new Date('2023-01-01T01:02:03Z');
overrideLogTimeProvider(() => logTime);

type LogTestExpectation = OneOf<ConsoleKeys, LogMessage>;

let lastConsoleMessage: any = undefined;

function createConsoleSpy(method: ConsoleKeys) {
  const originalMethod = console[ method ];
  const spy = vi.spyOn(console, method);
  spy.mockImplementation((...args: any[]) => {
    if (lastConsoleMessage !== undefined) {
      const lastConsoleMessageJson = isString(lastConsoleMessage)
        ? lastConsoleMessage
        : jsonStringifyBetter(lastConsoleMessage);
      throw new AssertionError({
        message: `Unexpected extra call to console.${method}. 'lastConsoleMessage' is already set.\n\n${lastConsoleMessageJson}`,
      });
    }

    if (args.length !== 1) {
      throw new AssertionError({
        message: `Unsupported logging call to console.${method}. Expected one argument but received ${
          args.length
        }.\n\n${jsonStringifyBetter(args)}`,
      });
    }

    const logMessage = args[ 0 ];

    if (!isString(logMessage)) {
      throw new AssertionError(
        {
          message: `Unsupported logging call to console.${ method }. Expected a string argument but received ${ typeof logMessage }.
          \n\n${ jsonStringifyBetter(logMessage) }`
        }
      );
    }
    lastConsoleMessage = {
      [method]: yamlParse(logMessage),
    };
  });
}

describe('createLogCode', () => {

  test('pre-calculated string', () => {
    mockRandom(
      // acefhjkmnprtuvxy3479
      3 / 19, // f
      9 / 19, // p
      20 / 19, // 9

      // 3479
      0, // 3
      2 / 3, // 7

      // acefhjkmnprtuvxy3479
      18 / 19, // 7
      0, // a,
      12 / 19, // u
    );

    const actual = createLogCode();

    expect(actual).toBe('fp9-37-7au');
  });
});

describe('loggers', () => {

  beforeEach(() => {
    (
      [ 'debug', 'info', 'log', 'warn', 'error' ] as ConsoleKeys[]
    ).forEach(method => createConsoleSpy(method));
  });

  afterEach(() => {
    lastConsoleMessage =undefined;
  });


  test('${ LogLevel.local } [test(local)] Simple test', () => {
      logLocal('log.test', 'Testing', {});
      expect(lastConsoleMessage).toEqual({
        log: {
          time: logTime,
          staticMessage: 'Testing',
          level: LogLevel.local,
          source: 'log.test',
          metadata: {},
          error: undefined,
        },
      });
    });

    test('${ LogLevel.debug } [test(debug)] Simple test', () => {
      logDebug('log.test', 'Testing', {});
      expect(lastConsoleMessage).toEqual({
        debug: {
          time: logTime,
          staticMessage: 'Testing',
          level: LogLevel.debug,
          source: 'log.test',
          metadata: {},
          error: undefined,
        },
      });
    });

    test('${ LogLevel.info } [test(info)] Simple test', () => {
      logInfo('log.test', 'Testing', {});
      expect(lastConsoleMessage).toEqual({
        info: {
          time: logTime,
          staticMessage: 'Testing',
          level: LogLevel.info,
          source: 'log.test',
          metadata: {},
          error: undefined,
        },
      });
    });

    test('${ LogLevel.warn } [test(warn)] Simple test', () => {
      logWarn('log.test', 'Testing', {});
      expect(lastConsoleMessage).toEqual({
        warn: {
          time: logTime,
          staticMessage: 'Testing',
          level: LogLevel.warn,
          source: 'log.test',
          metadata: {},
          error: undefined,
        },
      });
    });

    test('${ LogLevel.error } [test(error)] Simple test', () => {
      logError('log.test', 'Testing', {});
      expect(lastConsoleMessage).toEqual({
        error: {
          time: logTime,
          staticMessage: 'Testing',
          level: LogLevel.error,
          source: 'log.test',
          metadata: {},
          error: undefined,
        },
      });
    });

    test('${ LogLevel.fatal } [test(fatal)] Simple test', () => {
      logFatal('log.test', 'Testing', {});
      expect(lastConsoleMessage).toEqual({
        error: {
          time: logTime,
          staticMessage: 'Testing',
          level: LogLevel.fatal,
          source: 'log.test',
          metadata: {},
          error: undefined,
        },
      });
    });

    function createMessageTest(
      level: LogLevel,
      source: any,
      staticMessage: string,
      metadata: ObjectMap<unknown>,
      error: Error | undefined,
      expected: LogTestExpectation,
    ) {
      test(`${ level } [${ source }] ${ staticMessage }`, () => {
        logMessage({
          time: logTime,
          level,
          source,
          staticMessage,
          metadata,
          error,
        });
        const consoleKey = logLevelConsoleMethodMap[ level ];
        const expectedContent = expected[ consoleKey ];
        const expectedError = expectedContent?.error;
        const errorSafeExpected = isError(expectedError)
          ? {
              [consoleKey]: {
                ...expectedContent,
                error: {
                  message: expectedError.message,
                  stack: cleanCodePaths(expectedError.stack),
                },
              },
            }
          : expected;

        expect(lastConsoleMessage).toEqual(errorSafeExpected);
      });
    }

    createMessageTest(
      LogLevel.debug,
      'log-test-1',
      'Simple debug test with only a message',
      {},
      undefined,
      {
        debug: {
          time: logTime,
          staticMessage: 'Simple debug test with only a message',
          level: LogLevel.debug,
          source: 'log-test-1',
          metadata: {},
          error: undefined,
        },
      },
    );

    createMessageTest(
      LogLevel.debug,
      'log-test-1',
      'Simple debug test with only a message',
      {},
      undefined,
      {
        debug: {
          time: logTime,
          staticMessage: 'Simple debug test with only a message',
          level: LogLevel.debug,
          source: 'log-test-1',
          metadata: {},
          error: undefined,
        },
      },
    );

    createMessageTest(
      LogLevel.info,
      'log-test-2',
      'Info with simple metadata',
      {
        test: 'This is metadata',
      },
      undefined,
      {
        info: {
          time: logTime,
          staticMessage: 'Info with simple metadata',
          level: LogLevel.info,
          source: 'log-test-2',
          metadata: {
            test: 'This is metadata',
          },
          error: undefined,
        },
      },
    );

    createMessageTest(
      LogLevel.warn,
      'log-test-3',
      'Warning with more metadata of all scalar types.',
      {
        intValue: 123,
        floatValue: 12.56,
        booleanValue: false,
        date: logTime,
        nullValue: null,
        consoleKey: 'debug' as ConsoleKeys,
      },
      undefined,
      {
        warn: {
          time: logTime,
          staticMessage: 'Warning with more metadata of all scalar types.',
          level: LogLevel.warn,
          source: 'log-test-3',
          metadata: {
            intValue: 123,
            floatValue: 12.56,
            booleanValue: false,
            date: logTime,
            nullValue: null,
            consoleKey: 'debug' as ConsoleKeys,
          },
          error: undefined,
        },
      },
    );

    const err4 = new Error('This is a test error for log test 4');

    createMessageTest(
      LogLevel.error,
      'log-test-4',
      'Error with nested metadata and error',
      {
        user: {
          name: 'Tester',
          role: 'Breaker',
          permissions: ['break things', 'test things'],
        },
      },
      err4,
      {
        error: {
          time: logTime,
          staticMessage: 'Error with nested metadata and error',
          level: LogLevel.error,
          source: 'log-test-4',
          metadata: {
            user: {
              name: 'Tester',
              role: 'Breaker',
              permissions: ['break things', 'test things'],
            },
          },
          error: err4,
        },
      },
    );

    createMessageTest(
      LogLevel.fatal,
      'log-test-5',
      'Fatal with array that gets cut off',
      {
        bigArrayWithTwentyOneElements: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21,
        ],
      },
      undefined,
      {
        error: {
          time: logTime,
          staticMessage: 'Fatal with array that gets cut off',
          level: LogLevel.fatal,
          source: 'log-test-5',
          metadata: {
            bigArrayWithTwentyOneElements: [
              1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
              20,
            ],
          },
          error: undefined,
        },
      },
    );

    createMessageTest(
      LogLevel.local,
      'log-test-6',
      'Local with deep nesting that gets cut off',
      {
        a: {
          b: {
            c: {
              d: {
                e: {
                  f: {
                    g: {
                      thisShouldNotShowInResults: {},
                    },
                  },
                },
              },
            },
          },
        },
      },
      undefined,
      {
        log: {
          time: logTime,
          staticMessage: 'Local with deep nesting that gets cut off',
          level: LogLevel.local,
          source: 'log-test-6',
          metadata: {
            a: {
              b: {
                c: {
                  d: {
                    e: {
                      f: {
                        g: {},
                      },
                    },
                  },
                },
              },
            },
          },
          error: undefined,
        },
      },
    );
});
