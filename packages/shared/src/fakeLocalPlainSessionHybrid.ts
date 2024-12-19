import { fakeLocalJwtTokenPrefix } from './constants';

// used in local development only to auth without accessing AWS (due to time it takes to round-trip)
export function fakeLocalPlainSessionHybrid(advisorEmail: string) {
  return {
    isValid() {
      return true;
    },
    idToken: {
      jwtToken: `${fakeLocalJwtTokenPrefix};${advisorEmail}`,
      payload: {
        sub: "",
        email_verified: true,
        iss: "",
        "cognito:username": "",
        given_name: "",
        origin_jti: "",
        aud: "",
        event_id: "",
        token_use: "",
        auth_time: 10000,
        exp: 10000,
        iat: 10000,
        family_name: "",
        jti: "",
        email: "",
      },
    },
    refreshToken: {
      jwtToken: "",
      payload: {
        token: "",
      },
    },
    accessToken: {
      jwtToken: "",
      payload: {
        sub: "",
        iss: "",
        client_id: "",
        origin_jti: "",
        event_id: "",
        token_use: "",
        scope: "",
        auth_time: 10000,
        exp: 10000,
        iat: 10000,
        jti: "",
        username: "",
      },
    },
    clockDrift: 0,
  } as unknown as PlainCognitoUserSession;
}