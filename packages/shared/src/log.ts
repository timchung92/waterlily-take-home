import { isFunction, isString } from 'lodash';
import { ExError } from './ExError';
import { clonePlus, ClonePlusOptions, suppressKeyValuePair } from './clonePlus';
import { randomUnambiguousNumbers } from './randomUnambiguousNumbers';
import { randomUnambiguousString } from './randomUnambiguousString';
import { toObjectMap } from './toObjectMap';
import { yamlStringify } from './yaml';
import { regexReplaceWithBackreferences } from '.';

export enum LogLevel {
  local = 'local',
  debug = 'debug',
  info = 'info',
  audit = 'audit',
  warn = 'warn',
  error = 'error',
  fatal = 'fatal',
}

export const logLevelConsoleMethodMap = {
  ...toObjectMap(Object.keys(LogLevel)),
  local: 'log',
  audit: 'log',
  fatal: 'error',
} as Record<keyof typeof LogLevel, ConsoleKeys>;

export interface LogMessage {
  time: Date;
  level: LogLevel;
  source: unknown;
  staticMessage: string;
  metadata: ObjectMap<unknown>;
  error?: unknown;
}

export interface LogSender {
  (message: LogMessage): void;
}

type MetadataModifier = ClonePlusOptions['customizer'];

const metadataModifiers: ObjectMap<MetadataModifier> = {
  'multivalueheaders': metadataModifierSuppress,
  'accept-language': metadataModifierSuppress,
  'accept-encoding': metadataModifierSuppress,
  'sec-fetch-dest': metadataModifierSuppress,
  'sec-fetch-mode': metadataModifierSuppress,
  'sec-fetch-site': metadataModifierSuppress,
  'sec-ch-ua-platform': metadataModifierSuppress,
  'sec-ch-ua-mobile': metadataModifierSuppress,
  'sec-ch-ua': metadataModifierSuppress,

  'acceptlanguage': metadataModifierSuppress,
  'acceptencoding': metadataModifierSuppress,
  'secfetchdest': metadataModifierSuppress,
  'secfetchmode': metadataModifierSuppress,
  'secfetchsite': metadataModifierSuppress,
  'secchuaplatform': metadataModifierSuppress,
  'secchua-mobile': metadataModifierSuppress,
  'secchua': metadataModifierSuppress,

  'connection': metadataModifierSuppress,
  'isBase64Encoded': metadataModifierSuppress,
  'multiValueHeaders': metadataModifierSuppress,
  'multivaluequerystringparameters': metadataModifierSuppress,
  'stageVariables': metadataModifierSuppress,
  'cookie': metadataModifierCookie,

  '*': metadataModifierTrimEnd,
};

const logOnceKeysLogged = new Set<string>();

const logSenders: LogSender[] = [];

export function addLogSender(logSender: LogSender) {
  logSenders.push(logSender);
}

let logTimeProvider = () => new Date();
export function overrideLogTimeProvider(provider: typeof logTimeProvider) {
  logTimeProvider = provider;
}

function createLogMethod(level: LogLevel) {
  function logImpl(
    source: unknown,
    staticMessage: string,
    metadata: ObjectMap<unknown>,
    error?: unknown,
  ): void {
    logMessage({
      time: logTimeProvider(),
      level,
      source,
      staticMessage,
      metadata,
      error,
    });
  }

  return logImpl;
}

function createLogOnceMethod(level: LogLevel) {
  function logOnceImpl(
    source: unknown,
    staticMessage: string,
    metadata: ObjectMap<unknown>,
    error?: unknown,
    onceKey?: string,
  ): void {
    const appliedOnceKey = onceKey || staticMessage;

    if (logOnceKeysLogged.has(appliedOnceKey)) {
      return;
    }
    logOnceKeysLogged.add(appliedOnceKey);

    logMessage({
      time: logTimeProvider(),
      level,
      source,
      staticMessage,
      metadata,
      error,
    });
  }

  return logOnceImpl;
}

/**
 * Creates a unique string that can be used to correlate error messages shown to a user and log messages recorded
 * by the system. Every error shown to the user should include a log code and a message with extra details should
 * be logged including that log code in the metadata. That way if a user needs support they can contact Waterlily
 * and we can lookup more information based on the log code. This is also why log codes are unambiguous letters;
 * to make it easier for a user to relay without mixing up characters.
 */
export function createLogCode(): string {
  return `${randomUnambiguousString(3)}-${randomUnambiguousNumbers(
    2,
  )}-${randomUnambiguousString(3)}`;
}

export function logMessage({
  time,
  level,
  source,
  staticMessage,
  metadata,
  error,
}: LogMessage): void {
  try {
    const message: LogMessage = {
      time,
      staticMessage,
      level,
      metadata: clonePlus(metadata, {
        isDeep: true,
        maxArrayLength: 20,
        maxDepth: 7,
        customizer: applyMetadataModifiers,
      }),
      source: sourceString(source),
    };

    if (error) {
      message.error = error;

      if (error instanceof ExError) {
        message.metadata.logCode =
          error.logCode ?? (error.logCode = createLogCode());
      }
    }

    logSenders.forEach(logSender => {
      logSender(message);
    });

    // if (isRunningLocal()) {
    const rawYaml = yamlStringify(message, { keepUndefined: true });
    const pathsCleanedYaml = cleanCodePaths(rawYaml);

    console[logLevelConsoleMethodMap[level] ?? 'log'](pathsCleanedYaml);
    // } else {
    //   console[ logLevelConsoleMethodMap[ level ] ](message);
    // }
  } catch (ex: unknown) {
    const exYaml = (
      typeof ex === 'object' && ex !== null && 'stack' in ex
        ? (ex.stack as string)
        : String(ex)
    )
      .split('\n')
      .map(s => `            ${s}`)
      .join('\n')
      .trimStart();

    console.error(
      `
          message: Error logging message
          level: fatal
          source: logMessage
          metadata: {}
          error: |
            ${exYaml},
      `,
    );
  }
}

function sourceString(source: unknown) {
  return isFunction(source) ? source.name : String(source);
}

export const logLocal = createLogMethod(LogLevel.local);
export const logDebug = createLogMethod(LogLevel.debug);
export const logInfo = createLogMethod(LogLevel.info);
export const logWarn = createLogMethod(LogLevel.warn);
export const logError = createLogMethod(LogLevel.error);
export const logFatal = createLogMethod(LogLevel.fatal);
export const logAudit = createLogMethod(LogLevel.audit);

export const logOnceLocal = createLogOnceMethod(LogLevel.local);
export const logOnceDebug = createLogOnceMethod(LogLevel.debug);
export const logOnceInfo = createLogOnceMethod(LogLevel.info);
export const logOnceWarn = createLogOnceMethod(LogLevel.warn);
export const logOnceError = createLogOnceMethod(LogLevel.error);
export const logOnceFatal = createLogOnceMethod(LogLevel.fatal);

export function applyMetadataModifiers(
  value: any,
  key: unknown,
  parent: any,
  foundObjects: Map<unknown, unknown>,
) {
  const firstPass = applyMetadataModifier(
    metadataModifiers[String(key).toLowerCase()],
    value,
    key,
    parent,
    foundObjects,
  );
  const secondPass = applyMetadataModifier(
    metadataModifiers['*'],
    firstPass,
    key,
    parent,
    foundObjects,
  );

  return secondPass;
}

export function applyMetadataModifier(
  modifier: MetadataModifier | undefined,
  value: any,
  key: unknown,
  parent: any,
  foundObjects: Map<unknown, unknown>,
) {
  return modifier === undefined
    ? value
    : modifier(value, key, parent, foundObjects);
}

function metadataModifierSuppress(
  _value: any,
  _key: unknown,
  _parent: any,
  _foundObjects: unknown,
) {
  return suppressKeyValuePair;
}

function metadataModifierCookie(
  value: any,
  _key: unknown,
  _parent: any,
  _foundObjects: unknown,
) {
  if (!isString(value) || value.length < 20) {
    return value;
  }
  const shortenedCooie = value
    .split('; ')
    .map(s =>
      s
        .split('=')
        .map(s2 => s2.substring(0, 5))
        .join('='),
    )
    .join('; ');
  return `[Short from ${value.length} chars] ${shortenedCooie}`;
}

function metadataModifierTrimEnd(
  value: any,
  _key: unknown,
  _parent: any,
  _foundObjects: unknown,
) {
  return isString(value) ? value.replace(/ *\n *$/, '') : value;
}

export function cleanCodePaths(text: string | undefined) {
  return isString(text)
    ? regexReplaceWithBackreferences(
        text,
        /(^|\s|\()(?:file:)?\/[!"#%&'()+,./0-9=@A-Z\[\]_a-z\{\}~-]+(\/waterlily-ltc-planning-app)/g,
        '$1$2',
      )
    : text;
}
