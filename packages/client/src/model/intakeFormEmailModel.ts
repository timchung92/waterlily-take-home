import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { ApiExError } from '@shared';

const intakeFormEmailSlice = createSlice({
  name: 'intakeFormEmail',
  initialState: initialState.intakeFormEmail,
  reducers: {
    postIntakeFormEmailRequest(
      state,
      action: PayloadAction<IntakeFormEmailProps>,
    ) {
      if (action.payload.isTestEmail) {
        state.status = 'sending test email';
      } else {
        state.status = 'loading';
      }
    },
    postIntakeFormEmailResponse(state, _action: PayloadAction<unknown>) {
      if (state.status === 'sending test email') {
        state.status = 'complete test email';
      } else {
        state.status = 'complete';
      }
    },
    postIntakeFormEmailFailure(state, action: PayloadAction<ApiExError>) {
      state.status = 'error';
    },
    resetIntakeFormEmail(state) {
      state.status = null;
      state.errorMessage = null;
      state.partialSuccessMessage = null;
    },
    postBatchIntakeFormEmailRequest(
      state,
      action: PayloadAction<BatchIntakeFormEmailProps>,
    ) {
      state.errorMessage = null;
      state.partialSuccessMessage = null;
      state.status = 'loading';
    },
    postBatchIntakeFormEmailResponse(
      state,
      action: PayloadAction<BatchEmailResult>,
    ) {
      const { errorCount, successCount, errors } = action.payload;
      if (successCount > 0 && errorCount > 0) {
        state.status = 'complete with errors';
        state.errorMessage = `The following emails failed to send: ${errors
          .map(error => error.email)
          .join(
            ', ',
          )}. Please try again or contact support if the issue persists.`;
        state.failedEmails = errors.map(error => error.email);
        state.partialSuccessMessage = `Successfully sent ${successCount} invites. `;
      } else if (successCount > 0) {
        state.status = 'complete';
      } else {
        state.status = 'error';
        state.errorMessage = 'Error sending invites';
      }
    },
    postBatchIntakeFormEmailFailure(state, action: PayloadAction<ApiExError>) {
      state.status = 'error';
    },
  },
});

export const {
  postIntakeFormEmailRequest,
  postIntakeFormEmailResponse,
  postIntakeFormEmailFailure,
  resetIntakeFormEmail,
  postBatchIntakeFormEmailRequest,
  postBatchIntakeFormEmailResponse,
  postBatchIntakeFormEmailFailure,
} = intakeFormEmailSlice.actions;

export const intakeFormEmailSliceReducer = intakeFormEmailSlice.reducer;
