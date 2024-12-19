import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { SessionType, isNullOrUndefined, jsonParseBetter, localBypassAuthStorageKey, useLocalAuthBypass } from '@shared';
import type { ChildrenProps } from '../types/ChildrenProps';
import {
  closeSession,
  fetchSessionForAuthRequest,
  selectSession,
  storeCognitoSession,
} from '../model';
import { recoverPersistedCognito } from '../util';
import { MAGIC_LINK_SESSION_STORAGE_KEY } from '..';
import { useNavigate } from 'react-router';

let loadingSession = false;

export function SessionLoader({ children }: ChildrenProps) {
  const session = useSelector(selectSession);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(
    () => {
      async function maybeLoadPersistedSession() {
        loadingSession = true;

        const newCognitoSession =
          (
            useLocalAuthBypass()
              ? jsonParseBetter(localStorage.getItem(localBypassAuthStorageKey)) as PlainCognitoUserSession
              : undefined
          ) ??
          await recoverPersistedCognito();

        if (isNullOrUndefined(newCognitoSession)) {
          dispatch(closeSession());
          return;
        }

        dispatch(storeCognitoSession(newCognitoSession));
        dispatch(fetchSessionForAuthRequest());
      };

      if (session.sessionType !== SessionType.unknown) {
        return;
      }

      // if we have a magic link session in local storage, use it
      const persistedMagicLinkSession = jsonParseBetter<MagicLink>(localStorage.getItem(MAGIC_LINK_SESSION_STORAGE_KEY));
      if (persistedMagicLinkSession?.clientId && persistedMagicLinkSession?.token) {
        localStorage.removeItem(MAGIC_LINK_SESSION_STORAGE_KEY);
        navigate(`/auth/magic-link/${persistedMagicLinkSession.token}`);
      }

      if (!loadingSession && isNullOrUndefined(session.cognitoSession)) {
        maybeLoadPersistedSession();
      }
    },
    [
      dispatch,
      session
    ]
  );

  return session.sessionType === SessionType.unknown ? null : children;
}
