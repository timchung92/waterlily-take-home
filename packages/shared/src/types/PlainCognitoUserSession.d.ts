
	declare interface PlainCognitoUserSession {
    idToken: PlainCognitoIdToken;
    refreshToken: PlainCognitoRefreshToken | null;
    accessToken: PlainCognitoAccessToken | null;
    isValid: boolean;
    clockDrift: number | null;
  }

declare interface PlainCognitoBaseToken<TPayload> {
  jwtToken: string;
  payload: TPayload;
}

declare interface PlainCognitoIdToken
  extends PlainCognitoBaseToken<PlainCognitoIdPayload> {}

declare interface PlainCognitoIdPayload {
  sub: string;
  email_verified: boolean;
  iss: string;
  'cognito:username': string;
  given_name: string;
  origin_jti: string;
  aud: string;
  event_id: string;
  token_use: string;
  auth_time: number;
  exp: number;
  iat: number;
  family_name: string;
  jti: string;
  email: string;
}

declare interface PlainCognitoRefreshToken {
  token: string;
}

declare interface PlainCognitoAccessToken
  extends PlainCognitoBaseToken<PlainCognitoAccessPayload> {}

declare interface PlainCognitoAccessPayload {
  sub: string;
  iss: string;
  client_id: string;
  origin_jti: string;
  event_id: string;
  token_use: string;
  scope: string;
  auth_time: number;
  exp: number;
  iat: number;
  jti: string;
  username: string;
}
