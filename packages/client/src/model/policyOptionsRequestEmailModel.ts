import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { ApiExError } from '@shared';

const policyOptionsRequestEmailSlice = createSlice({
  name: 'intakeFormEmail',
  initialState: initialState.policyOptionsRequestEmail,
  reducers: {
    postPolicyOptionsRequestEmailRequest(state, _action: PayloadAction<PolicyOptionsRequestEmailProps>) {
        state.isLoading = true;
    },
    postPolicyOptionsRequestEmailResponse(state, action: PayloadAction<PolicyOptionsRequestEmailProps>) {
      state.isLoading = false;
    },
    postPolicyOptionsRequestEmailFailure(state, _action: PayloadAction<ApiExError>) {
        state.isLoading = false;
    },
  }
});

export const {
    postPolicyOptionsRequestEmailRequest,
    postPolicyOptionsRequestEmailResponse,
    postPolicyOptionsRequestEmailFailure,
} = policyOptionsRequestEmailSlice.actions;

export const policyOptionsRequestEmailReducer = policyOptionsRequestEmailSlice.reducer;
