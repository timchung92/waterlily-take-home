import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { ApiExError, ExError, apiReponseErrorIncludes } from '@shared';

const verifyPartnerLinkRequestSlice = createSlice({
  name: 'verifyPartnerLinkRequest',
  initialState: initialState.verifyPartnerLinkRequest,
  reducers: {
    fetchPartnerLinkRequestRecordByTokenForPublicRequest(
      state,
      _action: PayloadAction<string>,
    ) {
      state.status = 'loading';
    },
    fetchPartnerLinkRequestRecordByTokenForPublicResponse(
      state,
      action: PayloadAction<PartnerLinkRequestsDbRecord>,
    ) {
      state.status = null;
      state.dbRecord = action.payload;
    },
    fetchPartnerLinkRequestRecordByTokenForPublicFailure(
      state,
      action: PayloadAction<ApiExError>,
    ) {
      if (apiReponseErrorIncludes(action.payload, 'Invalid token')) {
        state.status = 'invalidToken';
      } else if (
        apiReponseErrorIncludes(action.payload, 'Request already accepted')
      ) {
        state.status = 'verified';
      } else if (apiReponseErrorIncludes(action.payload, 'Expired token')) {
        state.status = 'expired';
      } else if (
        apiReponseErrorIncludes(
          action.payload,
          'Exceeded allowable verification attempts',
        )
      ) {
        state.status = 'locked';
      }
    },
    clearVerifyPartnerLinkRequest(state) {
      state.status = null;
      state.errorMessage = null;
      state.dbRecord = null;
    },
    postVerifySecurityQuestionsPartnerLinkForClientByClientIdRequest(
      state,
      _action: PayloadAction<VerifySecurityQuestionsPartnerLinkBody>,
    ) {
      state.status = 'loading';
      state.errorMessage = '';
    },
    postVerifySecurityQuestionsPartnerLinkForClientByClientIdResponse(
      state,
      action: PayloadAction<PartnerLinkRequestsDbRecord>,
    ) {
      const dbRecord = action.payload;
      state.dbRecord = dbRecord;
      if (dbRecord.status === 'accepted') {
        state.status = 'verified';
        state.errorMessage = '';
      } else if (dbRecord.status === 'verification_failed') {
        state.status = 'failedToVerify';
        state.errorMessage =
          'One or more answers are incorrect. Please try again.';
      } else if (dbRecord.status === 'locked') {
        state.status = 'locked';
      } else {
        state.status = 'failedToVerify';
        state.errorMessage =
          'An unknown error occurred. Please contact support for assistance.';
      }
    },
    postVerifySecurityQuestionsPartnerLinkForClientByClientIdFailure(
      state,
      action: PayloadAction<ExError>,
    ) {
      state.status = 'failedToVerify';
      state.errorMessage = action.payload.message;
    },
  },
});

export const {
  fetchPartnerLinkRequestRecordByTokenForPublicRequest,
  fetchPartnerLinkRequestRecordByTokenForPublicResponse,
  fetchPartnerLinkRequestRecordByTokenForPublicFailure,
  postVerifySecurityQuestionsPartnerLinkForClientByClientIdRequest,
  postVerifySecurityQuestionsPartnerLinkForClientByClientIdResponse,
  postVerifySecurityQuestionsPartnerLinkForClientByClientIdFailure,
  clearVerifyPartnerLinkRequest,
} = verifyPartnerLinkRequestSlice.actions;

export const verifyPartnerLinkRequestReducer =
  verifyPartnerLinkRequestSlice.reducer;
