import { useSelector } from 'react-redux';
import { selectMagicLinkSession, selectSession } from '..';

export type AuthHeader = { Authorization: string };

export function useAuthHeader(): AuthHeader | undefined {
  const { cognitoSession, sessionType } = useSelector(selectSession);
  const { token: magicLinkToken } = useSelector(selectMagicLinkSession);

  if (magicLinkToken) {
    return { Authorization: `Bearer ${magicLinkToken}` };
  }
  if (cognitoSession) {
    return { Authorization: `Bearer ${cognitoSession.idToken.jwtToken}` };
  }
  return undefined;
}
