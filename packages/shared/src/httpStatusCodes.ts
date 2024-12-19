/**
 * Maps both from HTTP status code messages to numeric codes and numeric codes back to messages.
 *
 * Is an object, not an enum, since integration with other APIs too often requires a string.
 */
export const httpStatusCodes = {
  clientSideError: '000',
  continue: '100',
  switchingProtocols: '101',
  processing: '102',
  earlyHints: '103',
  ok: '200',
  created: '201',
  accepted: '202',
  nonAuthoritativeInformation: '203',
  noContent: '204',
  resetContent: '205',
  partialContent: '206',
  multiStatus: '207',
  alreadyReported: '208',
  imUsed: '226',
  multipleChoices: '300',
  movedPermanently: '301',
  found: '302',
  seeOther: '303',
  notModified: '304',
  useProxy: '305',
  temporaryRedirect: '307',
  permanentRedirect: '308',
  badRequest: '400',
  unauthorized: '401',
  paymentRequired: '402',
  forbidden: '403',
  notFound: '404',
  methodNotAllowed: '405',
  notAcceptable: '406',
  proxyAuthenticationRequired: '407',
  requestTimeout: '408',
  conflict: '409',
  gone: '410',
  lengthRequired: '411',
  preconditionFailed: '412',
  payloadTooLarge: '413',
  uriTooLong: '414',
  unsupportedMediaType: '415',
  rangeNotSatisfiable: '416',
  expectationFailed: '417',
  imATeapot: '418',
  misdirectedRequest: '421',
  unprocessableEntity: '422',
  locked: '423',
  failedDependency: '424',
  tooEarly: '425',
  upgradeRequired: '426',
  preconditionRequired: '428',
  tooManyRequests: '429',
  requestHeaderFieldsTooLarge: '431',
  unavailableForLegalReasons: '451',
  internalServerError: '500',
  notImplemented: '501',
  badGateway: '502',
  serviceUnavailable: '503',
  gatewayTimeout: '504',
  httpVersionNotSupported: '505',
  variantAlsoNegotiates: '506',
  insufficientStorage: '507',
  loopDetected: '508',
  bandwidthLimitExceeded: '509',
  notExtended: '510',
  networkAuthenticationRequired: '511'
};

export enum HttpStatusCategory {
  ClientInternalError,
  Informational,
  Ok,
  Redirect,
  UserError,
  ServerError,
}

export function toHttpStatusCodeCategory(code: string | number) {
  return Number.parseInt(code.toString().charAt(0)) as HttpStatusCategory;
}

export function isClientInternalErrorStatusCode(code: string | number) {
  return toHttpStatusCodeCategory(code) === HttpStatusCategory.ClientInternalError;
}

export function isInformationalStatusCode(code: string | number) {
  return toHttpStatusCodeCategory(code) === HttpStatusCategory.Informational;
}

export function isOkStatusCode(code: string | number) {
  return toHttpStatusCodeCategory(code) === HttpStatusCategory.Ok;
}

export function isRedirectStatusCode(code: string | number) {
  return toHttpStatusCodeCategory(code) === HttpStatusCategory.Redirect;
}

export function isUserErrorStatusCode(code: string | number) {
  return toHttpStatusCodeCategory(code) === HttpStatusCategory.UserError;
}

export function isServerErrorStatusCode(code: string | number) {
  return toHttpStatusCodeCategory(code) === HttpStatusCategory.ServerError;
}
