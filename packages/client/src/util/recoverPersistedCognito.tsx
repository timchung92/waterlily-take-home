import {
  ExError,
  isNullOrUndefined,
  logError,
} from '@shared';
import UserPool from "./UserPool";
import { parseCognitoSessionResponse } from "./parseCognitoSessionResponse";

export function recoverPersistedCognito(): Promise<PlainCognitoUserSession | null> {
  return new Promise(recoverPersistedCognitoImpl);

  function recoverPersistedCognitoImpl(
    resolve: (session: PlainCognitoUserSession | null) => void,
    reject: (error: ExError) => void
  ) {
    const user = UserPool.getCurrentUser();
    if (isNullOrUndefined(user)) {
      resolve(null);
      return;
    }

    user.getSession((error: any, data: unknown) => {
      try {

        if (error) {
          logError(
            recoverPersistedCognito,
            'Cognito threw an error recovering the session.',
            {
              error
            }
          );
          resolve(null);
          return;
        }

        const plainSession = parseCognitoSessionResponse(data);
        resolve(plainSession);
      } catch (ex: unknown) {
          logError(
            recoverPersistedCognito,
            'An error occurred processing the recovered the session.',
            {
              error: ex
            }
          );
        resolve(null);
      }
    });
  }
}
