declare module 'path-match' {
  const factoryFactory: PathMatcherFactoryFactory;
  export = factoryFactory;
}

declare type PathMatchParamsMap = {
  [name: string]: unknown;
};

declare type PathMatcherFactoryFactory = {
  (options?: PathMatcherFactoryOptions): PathMatcherFactory;
};

/**
 * Options for creating the matcher, passed directly to `path-to-regexp`.
 */
declare type PathMatcherFactoryOptions = {
  /**
   * When true the regexp will be case sensitive. (default: false)
   */
  sensitive: boolean;

  /**
   * When true the regexp won't allow an optional trailing delimiter to match. (default: false)
   */
  strict: boolean;

  /**
   * When true the regexp will match to the end of the string. (default: true)
   */
  end: boolean;

  /**
   * When true the regexp will match from the beginning of the string. (default: true)
   */
  start: boolean;

  /**
   * The default delimiter for segments, e.g. [^/#?] for :named patterns. (default: '/#?')
   */
  delimiter: boolean;

  /**
   * Optional character, or list of characters, to treat as "end" characters.
   */
  endsWith: boolean;

  /**
   * A function to encode strings before inserting into RegExp. (default: x => x)
   */
  encode: boolean;

  /**
   * List of characters to automatically consider prefixes when parsing. (default: ./)
   */
  prefixes: boolean;
};

declare type PathMatcherFactory = {
  <TParams = PathMatchParamsMap>(httpPathSpec: string): PathMatcher<TParams>;
};

declare type PathMatcher<TParams = PathMatchParamsMap> = {
  (httpPath: string, defaultParams?: Partial<TParams>): TParams | false;
};
