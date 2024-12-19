import {
  Action,
  AnyAction,
  PayloadAction,
  createSlice,
} from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { ApiExError, SessionType, isDefined, isNullOrUndefined } from '@shared';
import { AppState } from './store';
import { createSimpleMiddleware } from './createSimpleMiddleware';
import {
  postAdvisorUpdatesByAdvisorIdResponse,
  putAdvisorByAdvisorIdRequest,
} from './advisorModel';
import { Dispatch } from 'react';

const sessionSlice = createSlice({
  name: 'session',
  initialState: initialState.session,
  reducers: {
    fetchAdvisorExistsByAdvisorEmailForPublicRequest(
      state,
      { payload }: PayloadAction<AdvisorEmailProps>,
    ) {
      state.potentialNewAdvisor = null;
    },
    fetchAdvisorExistsByAdvisorEmailForPublicResponse(
      state,
      {
        payload: { advisorEmail, advisorExists },
      }: PayloadAction<AdvisorExistsResult>,
    ) {
      state.potentialNewAdvisor = {
        advisorEmail,
        advisorExists,
      };
    },
    fetchAdvisorExistsByAdvisorEmailForPublicFailure(
      _state,
      _action: PayloadAction<ApiExError>,
    ) {},
    storeCognitoSession(
      state,
      { payload }: PayloadAction<PlainCognitoUserSession>,
    ) {
      state.advisor = null;
      state.cognitoSession = payload;
    },
    setClientSessionType(state) {
      state.sessionType = SessionType.client;
    },
    fetchSessionForAuthRequest(state) {
      state.isLoading = true;
    },
    fetchSessionForAuthResponse(state, { payload }: PayloadAction<Session>) {
      state.isLoading = false;
      Object.assign(state, payload);
    },
    fetchSessionForAuthFailure(state, _action: PayloadAction<ApiExError>) {
      state.advisor = null;
      state.sessionType = SessionType.unauthenticated;
    },
    closeSession(state) {
      state.sessionType = SessionType.unauthenticated;
      state.advisor = null;
      state.cognitoSession = null;
    },
    storePotentialNewAdvisor(
      state,
      { payload }: PayloadAction<AdvisorExistsResult>,
    ) {
      state.potentialNewAdvisor = {
        ...state.potentialNewAdvisor,
        ...payload,
      };
    },
    putAdvisorConsentByAdvisorIdRequest(
      state,
      _action: PayloadAction<PutAdvisorConsentProps>,
    ) {
      state.isLoading = true;
    },
    putAdvisorConsentByAdvisorIdResponse(
      state,
      _action: PayloadAction<AdvisorConsentsDbRecord>,
    ) {
      state.isLoading = false;
      state.sessionType = SessionType.advisor;
    },
    putAdvisorConsentByAdvisorIdFailure(
      state,
      _action: PayloadAction<ApiExError>,
    ) {
      state.isLoading = false;
    },
  },
});

/**
 * Until we have proper user management and users created through our app, we're
 * hacking in organization data to the new user flow so if we detect a user
 * without an org and we have one cached then let's update that user.
 */
function organizationSaverMiddlewareImpl(
  dispatch: Dispatch<AnyAction>,
  getStore: () => AppState,
  next: Dispatch<AnyAction>,
  action: Action<string>,
) {
  next(action);

  if (action.type === fetchSessionForAuthResponse.type) {
    setTimeout(() =>
      maybeSaveNewOrganization(
        dispatch,
        getStore,
        action as PayloadAction<Session>,
      ),
    );
  }
}

function maybeSaveNewOrganization(
  dispatch: Dispatch<AnyAction>,
  getStore: () => AppState,
  { payload: { advisor } }: PayloadAction<Session>,
) {
  if (isNullOrUndefined(advisor) || isDefined(advisor.organizationName)) {
    return;
  }

  const {
    session: { potentialNewAdvisor },
  } = getStore();

  if (isNullOrUndefined(potentialNewAdvisor?.organizationName)) {
    return;
  }

  if (
    isDefined(advisor.advisorEmail) &&
    isDefined(potentialNewAdvisor?.advisorEmail) &&
    advisor.advisorEmail !== potentialNewAdvisor?.advisorEmail
  ) {
    // For now, advisorEmail should not be changed. In the event that the potentialNewAdvisor
    // state is stale, we should not update an existing advisor with incorrect potentialNewAdvisor
    return;
  }

  const updateAdvisor: Advisor = {
    ...advisor,
    ...potentialNewAdvisor,
  };

  dispatch(putAdvisorByAdvisorIdRequest(updateAdvisor));
}

export const organizationSaverMiddleware = createSimpleMiddleware(
  organizationSaverMiddlewareImpl,
);

function invalidateSessionMiddleWareImpl(
  dispatch: Dispatch<AnyAction>,
  _getStore: () => AppState,
  next: Dispatch<AnyAction>,
  action: Action<string>,
) {
  next(action);

  if (action.type === postAdvisorUpdatesByAdvisorIdResponse.type) {
    setTimeout(() => dispatch(fetchSessionForAuthRequest()));
  }
}

export const invalidateSessionMiddleWare = createSimpleMiddleware(
  invalidateSessionMiddleWareImpl,
);

export const {
  closeSession,
  fetchAdvisorExistsByAdvisorEmailForPublicRequest,
  fetchAdvisorExistsByAdvisorEmailForPublicResponse,
  fetchAdvisorExistsByAdvisorEmailForPublicFailure,
  fetchSessionForAuthRequest,
  fetchSessionForAuthResponse,
  fetchSessionForAuthFailure,
  storeCognitoSession,
  storePotentialNewAdvisor,
  setClientSessionType,
  putAdvisorConsentByAdvisorIdRequest,
  putAdvisorConsentByAdvisorIdResponse,
  putAdvisorConsentByAdvisorIdFailure,
} = sessionSlice.actions;

export const sessionReducer = sessionSlice.reducer;
