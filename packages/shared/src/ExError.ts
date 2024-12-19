import { hasOwnProperty } from './hasOwnProperty';
import { isError } from 'lodash';

import {
  isRunningLocal,
  unlessEmpty,
  isNullUndefinedOrEmpty,
  numberLines,
  clonePlus,
  indent,
  yamlStringify,
  regexReplaceWithBackreferences,
  errorCauseChain,
} from '@shared';

const stackTraceStartOfLine = / +at /;
const sourcePathStripStartExp =
  /(?:file:\/\/|\/).+(\/(?:packages|node_modules)\/)/g;

/**
 * Object representation of a fully flattened and summaries error for better logging and analysis.
 */
export type LoggableObject = {
  messages: string[];
  stackSummaries: string[];
  metadataFlattened: unknown;
  causeChain: unknown[]; // Technically anything can be thrown
  finalError: Error;
};

/**
 * Base error to use for all application errors thrown. Provides for separate message and metadata,
 * and better representation of all recursive causes and stack traces, plus whether an error has
 * been logged already to avoid duplication.
 */
export class ExError extends Error {
  public name = this.constructor.name;
  public logCode: string | undefined = undefined;

  constructor(
    public staticMessage: string,
    public metadata: ObjectMap<unknown>,
    cause?: unknown,
  ) {
    super(staticMessage, { cause });

    if (isRunningLocal()) {
      console.error(this.toString());
    }
  }

  addMetadata(moreMetadata: ObjectMap<unknown>) {
    Object.assign(this.metadata, moreMetadata);
    return this;
  }

  static wrapOrAddMetadata(
    staticMessage: string,
    metadata: ObjectMap<unknown>,
    cause: ExError | unknown,
  ): ExError {
    if (cause instanceof ExError) {
      return cause.addMetadata(metadata);
    }

    return new ExError(staticMessage, metadata, cause);
  }

  /**
   * Provides a huge print-out of the error details and all causes in a very easy-to-read and
   * organized output including the messages, in order of original to most re-thrown,
   * most relevant lines from each stack trace, flattened metadata, and the original error details
   * from each cause.
   *
   * @example
   *
   * 1> string: This is just a string error
   * 2> Error: Rethrowing string error as Error
   * 3> ExError: Error #3 as ExError
   * 4> Error: Error #4, rethrow ExError as Error
   * 5> ExError: Error #5 as ExError
   * 6> ExError: ExError #6
   *
   * 1> n.a.
   * 2> at completeCrazyTest (/packages/shared/test/ExError.test.ts:15:19)
   * 3> at completeCrazyTest (/packages/shared/test/ExError.test.ts:18:17)
   * 4> at completeCrazyTest (/packages/shared/test/ExError.test.ts:21:15)
   * 5> at completeCrazyTest (/packages/shared/test/ExError.test.ts:24:13)
   * 6> at completeCrazyTest (/packages/shared/test/ExError.test.ts:27:14)
   *
   *   depth: 5
   *   depth_5: 3
   *   a: A
   *   depth_6: 2
   *   a_6: A2
   *   b: B
   *   nesting:
   *     - c: {}
   *     - - One
   *       - Two
   *       - Three
   *       - Four
   *
   *
   * Original error:
   *   This is just a string error
   *
   * Error #2:
   *   Error: Rethrowing string error as Error
   *       at completeCrazyTest (/packages/shared/test/ExError.test.ts:15:19)
   *       at /node_modules/@vitest/runner/dist/index.js:132:13
   *       at /node_modules/@vitest/runner/dist/index.js:41:26
   *       at runTest (/node_modules/@vitest/runner/dist/index.js:449:15)
   *       at runSuite (/node_modules/@vitest/runner/dist/index.js:548:15)
   *       at runFiles (/node_modules/@vitest/runner/dist/index.js:599:5)
   *       at startTests (/node_modules/@vitest/runner/dist/index.js:608:3)
   *       at /node_modules/vitest/dist/entry.js:259:7
   *       at withEnv (/node_modules/vitest/dist/entry.js:184:5)
   *       at run (/node_modules/vitest/dist/entry.js:251:3)
   *
   * Error #3:
   *   ExError: Error #3 as ExError
   *       at completeCrazyTest (/packages/shared/test/ExError.test.ts:18:17)
   *       at /node_modules/@vitest/runner/dist/index.js:132:13
   *       at /node_modules/@vitest/runner/dist/index.js:41:26
   *       at runTest (/node_modules/@vitest/runner/dist/index.js:449:15)
   *       at runSuite (/node_modules/@vitest/runner/dist/index.js:548:15)
   *       at runFiles (/node_modules/@vitest/runner/dist/index.js:599:5)
   *       at startTests (/node_modules/@vitest/runner/dist/index.js:608:3)
   *       at /node_modules/vitest/dist/entry.js:259:7
   *       at withEnv (/node_modules/vitest/dist/entry.js:184:5)
   *       at run (/node_modules/vitest/dist/entry.js:251:3)
   *
   * Error #4:
   *   Error: Error #4, rethrow ExError as Error
   *       at completeCrazyTest (/packages/shared/test/ExError.test.ts:21:15)
   *       at /node_modules/@vitest/runner/dist/index.js:132:13
   *       at /node_modules/@vitest/runner/dist/index.js:41:26
   *       at runTest (/node_modules/@vitest/runner/dist/index.js:449:15)
   *       at runSuite (/node_modules/@vitest/runner/dist/index.js:548:15)
   *       at runFiles (/node_modules/@vitest/runner/dist/index.js:599:5)
   *       at startTests (/node_modules/@vitest/runner/dist/index.js:608:3)
   *       at /node_modules/vitest/dist/entry.js:259:7
   *       at withEnv (/node_modules/vitest/dist/entry.js:184:5)
   *       at run (/node_modules/vitest/dist/entry.js:251:3)
   *
   * Error #5:
   *   ExError: Error #5 as ExError
   *       at completeCrazyTest (/packages/shared/test/ExError.test.ts:24:13)
   *       at /node_modules/@vitest/runner/dist/index.js:132:13
   *       at /node_modules/@vitest/runner/dist/index.js:41:26
   *       at runTest (/node_modules/@vitest/runner/dist/index.js:449:15)
   *       at runSuite (/node_modules/@vitest/runner/dist/index.js:548:15)
   *       at runFiles (/node_modules/@vitest/runner/dist/index.js:599:5)
   *       at startTests (/node_modules/@vitest/runner/dist/index.js:608:3)
   *       at /node_modules/vitest/dist/entry.js:259:7
   *       at withEnv (/node_modules/vitest/dist/entry.js:184:5)
   *       at run (/node_modules/vitest/dist/entry.js:251:3)
   *
   * Error #6:
   *   ExError: ExError #6
   *       at completeCrazyTest (/packages/shared/test/ExError.test.ts:27:14)
   *       at /node_modules/@vitest/runner/dist/index.js:132:13
   *       at /node_modules/@vitest/runner/dist/index.js:41:26
   *       at runTest (/node_modules/@vitest/runner/dist/index.js:449:15)
   *       at runSuite (/node_modules/@vitest/runner/dist/index.js:548:15)
   *       at runFiles (/node_modules/@vitest/runner/dist/index.js:599:5)
   *       at startTests (/node_modules/@vitest/runner/dist/index.js:608:3)
   *       at /node_modules/vitest/dist/entry.js:259:7
   *       at withEnv (/node_modules/vitest/dist/entry.js:184:5)
   *       at run (/node_modules/vitest/dist/entry.js:251:3)
   *
   */
  public toString() {
    const loggable = this.toLoggableObject();

    const messages = numberLines(loggable.messages).join('\n');
    const stackSummaries = numberLines(loggable.stackSummaries).join('\n');
    const metadataFlattened = indent(
      yamlStringify(
        loggable.metadataFlattened,
        // (key, value: unknown) => {
        //   // const logModified = applyMetadataModifiers(value, key);
        //   // const interim = logModified === undefined ? value : logModified;

        //   // const final =
        //   //   isString(interim) && interim.includes('\n')
        //   //     ? interim.trimEnd()
        //   //     : interim;

        //   // return final;

        //   if (metadataKeysToSuppress.has(key)) {
        //     return undefined;
        //   }
        //   if (key === 'cookie' && isString(value)) {
        //     const shortenedCooie =
        //       value
        //         .split('; ')
        //         .map(s =>
        //           s
        //             .split('=')
        //             .map(s2 => s2.substring(0, 5))
        //             .join('='),
        //         )
        //         .join('; ');
        //     value = `[Short from ${value.length} chars] ${shortenedCooie}`;
        //   }

        //   if (isString(value) && value.includes('\n')) {
        //     value = value.trimEnd();
        //   }

        //   return value;
        // },
        {
          blockQuote: 'literal',
          lineWidth: 240,
          keepUndefined: false,
        },
      ),
    );

    const fullStacks = loggable.causeChain.map((ex, index) => {
      const heading = index === 0 ? 'Original error:' : `Error #${index + 1}:`;

      const indented = indent(
        isError(ex) && ex.stack
          ? regexReplaceWithBackreferences(
              ex.stack,
              sourcePathStripStartExp,
              '.$1',
            )
          : String(ex),
      );

      return `${heading}\n${indented}`;
    });

    return [
      messages,
      stackSummaries,
      metadataFlattened,
      fullStacks.join('\n\n'),
    ].join('\n\n');
  }

  public flattenMetadata() {
    const metadataFlattened: ObjectMap<unknown> = {};
    const causeChain = errorCauseChain(this);

    causeChain.forEach((ex: unknown, index: number) => {
      if (ex instanceof ExError) {
        const entries = Object.entries(ex.metadata);
        entries.forEach(([key, value]) => {
          // const appliedValue = applyMetadataModifiers(value, key);
          // if (appliedValue === suppressKeyValuePair) {
          //   return;
          // }

          // if (key === 'event') {
          //   const headers = appliedValue?.headers;
          //   if (headers) {
          //     Object.entries(headers).forEach(([headerName, headerValue]) => {
          //       const appliedHeaderValue = applyMetadataModifiers(
          //         headerValue,
          //         headerName,
          //       );
          //       if (
          //         appliedHeaderValue === suppressKeyValuePair ||
          //         appliedHeaderValue === undefined
          //       ) {
          //         delete headers[headerName];
          //         return;
          //       }
          //       headers[headerName] = headerValue;
          //     });
          //   }
          //   delete appliedValue['multiValueHeaders'];
          // }

          const appliedKey = hasOwnProperty(metadataFlattened, key)
            ? `${key}_${index + 1}`
            : key;

          metadataFlattened[appliedKey] = value; // appliedValue;
        });
      }
    });

    return metadataFlattened;
  }

  public toLoggableObject(): LoggableObject {
    const messages = [] as string[];
    const stackSummaries = [] as string[];
    const metadataFlattened = this.flattenMetadata();

    const causeChain = errorCauseChain(this);

    causeChain.forEach((ex: unknown) => {
      if (ex instanceof Error) {
        const nameWithColon = unlessEmpty`${ex.name}: `;
        messages.push(`${nameWithColon}${ex.message}`);
        stackSummaries.push(this.stackTraceMostRelevantLine(ex.stack));
      } else {
        messages.push(`${typeof ex}: ${String(ex)}`);
        stackSummaries.push('n.a.');
      }
    });

    return {
      messages,
      stackSummaries,
      metadataFlattened: clonePlus(metadataFlattened, {
        maxDepth: 3,
        maxArrayLength: 40,
      }),
      causeChain,
      finalError: this,
    };
  }

  private stackTraceMostRelevantLine(stackTrace?: string): string {
    if (isNullUndefinedOrEmpty(stackTrace)) {
      return 'n.a.';
    }
    const lines = stackTrace
      .split('\n')
      .filter(line => stackTraceStartOfLine.test(line));
    for (const line of lines) {
      if (line.includes('waterlily')) {
        return regexReplaceWithBackreferences(
          line.trim(),
          sourcePathStripStartExp,
          '.$1',
        );
      }
    }

    return lines[0];
  }
}
