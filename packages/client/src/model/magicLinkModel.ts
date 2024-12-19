import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { ApiExError, apiReponseErrorIncludes } from '@shared';

const magicLinkSessionSlice = createSlice({
  name: 'magicLinkSessionByToken',
  initialState: initialState.magicLinkSessionByToken,
  reducers: {
    storeMagicLinkSessionByToken(state, { payload }: PayloadAction<MagicLink>) {
      Object.assign(state, payload);
    },
    fetchMagicLinkSessionForClientByTokenForPublicRequest(
      state,
      _action: PayloadAction<string>,
    ) {
      state.status = 'fetchingSession';
    },
    fetchMagicLinkSessionForClientByTokenForPublicResponse(
      state,
      action: PayloadAction<MagicLink>,
    ) {
      state.status = 'sessionFetched';
      Object.assign(state, action.payload);
    },
    fetchMagicLinkSessionForClientByTokenForPublicFailure(
      state,
      action: PayloadAction<ApiExError>,
    ) {
      if (apiReponseErrorIncludes(action.payload, 'Expired token')) {
        state.status = 'expired';
      }
      if (apiReponseErrorIncludes(action.payload, 'Token already used')) {
        state.status = 'used';
      }
      if (apiReponseErrorIncludes(action.payload, 'Account is locked')) {
        state.status = 'locked';
      }
    },
    postVerifySecurityQuestionsMagicLinkForClientByClientIdRequest(
      _state,
      _action: PayloadAction<VerifySecurityQuestionsMagicLinkBody>,
    ) {},
    postVerifySecurityQuestionsMagicLinkForClientByClientIdResponse(
      state,
      action: PayloadAction<VerifySecurityQuestionsResponse>,
    ) {
      state.hasVerifiedSecurityQuestions = action.payload.isValid;
    },
    postVerifySecurityQuestionsMagicLinkForClientByClientIdFailure(
      _state,
      _action: PayloadAction<ApiExError>,
    ) {},
    putMagicLinkSessionByTokenForPublicRequest(
      state,
      action: PayloadAction<{ token: string }>,
    ) {
      // Clear previous client data when requesting new link
      return {
        ...initialState.magicLinkSessionByToken,
        token: action.payload.token,
        status: 'sendingNew',
      };
    },
    putMagicLinkSessionByTokenForPublicResponse(
      state,
      action: PayloadAction<CreateMagicLinkResponse>,
    ) {
      state.status = 'newLinkSent';
      state.clientEmail = action.payload.clientEmail;
    },
    putMagicLinkSessionByTokenForPublicFailure(
      state,
      _action: PayloadAction<string>,
    ) {
      state.status = 'error';
    },
    // Add a new action to clear the state
    clearMagicLinkSession(state) {
      return initialState.magicLinkSessionByToken;
    },
  },
});

export const {
  fetchMagicLinkSessionForClientByTokenForPublicRequest,
  fetchMagicLinkSessionForClientByTokenForPublicResponse,
  fetchMagicLinkSessionForClientByTokenForPublicFailure,
  storeMagicLinkSessionByToken,
  putMagicLinkSessionByTokenForPublicRequest,
  putMagicLinkSessionByTokenForPublicResponse,
  putMagicLinkSessionByTokenForPublicFailure,
  postVerifySecurityQuestionsMagicLinkForClientByClientIdResponse,
  postVerifySecurityQuestionsMagicLinkForClientByClientIdRequest,
  postVerifySecurityQuestionsMagicLinkForClientByClientIdFailure,
  clearMagicLinkSession,
} = magicLinkSessionSlice.actions;

export const magicLinkSessionByTokenReducer = magicLinkSessionSlice.reducer;
