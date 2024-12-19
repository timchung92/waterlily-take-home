import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { ApiExError } from '@shared';

const emailPreferencesSlice = createSlice({
  name: 'emailPreferences',
  initialState: initialState.emailPreferences,
  reducers: {
    fetchEmailPreferencesForPublicByEmailRequest: (
      state,
      _action: PayloadAction<string>,
    ) => {
      state.isLoading = true;
    },
    fetchEmailPreferencesForPublicByEmailResponse: (
      state,
      action: PayloadAction<EmailPreferences>,
    ) => {
      state.isLoading = false;
      state.email = action.payload.email;
      state.optOutReminders = action.payload.optOutReminders;
      state.optOutTransactions = action.payload.optOutTransactions;
    },
    fetchEmailPreferencesForPublicByEmailFailure: (
      state,
      action: PayloadAction<ApiExError>,
    ) => {
      state.isLoading = false;
      if (
        (action.payload.metadata.response as ApiResponseError)?.body
          ?.errorMessage
      ) {
        state.error = (
          action.payload.metadata.response as ApiResponseError
        )?.body?.errorMessage;
      } else {
        state.error =
          'Could not retrieve email preferences because of an error, if you see this please contact support.';
      }
    },

    putEmailPreferencesForPublicRequest: (
      state,
      action: PayloadAction<EmailPreferences>,
    ) => {},
    putEmailPreferencesForPublicResponse: (
      state,
      action: PayloadAction<EmailPreferences>,
    ) => {
      state.email = action.payload.email;
      state.optOutReminders = action.payload.optOutReminders;
      state.optOutTransactions = action.payload.optOutTransactions;
    },
    putEmailPreferencesForPublicFailure: (
      state,
      action: PayloadAction<ApiExError>,
    ) => {
      if (
        (action.payload.metadata.response as ApiResponseError)?.body
          ?.errorMessage
      ) {
        state.error = (
          action.payload.metadata.response as ApiResponseError
        )?.body?.errorMessage;
      } else {
        state.error =
          'Could not update email preferences because of an error, if you see this please contact support.';
      }
    },
  },
});

export const {
  fetchEmailPreferencesForPublicByEmailRequest,
  fetchEmailPreferencesForPublicByEmailResponse,
  fetchEmailPreferencesForPublicByEmailFailure,
  putEmailPreferencesForPublicRequest,
  putEmailPreferencesForPublicResponse,
  putEmailPreferencesForPublicFailure,
} = emailPreferencesSlice.actions;

export const emailPreferencesReducer = emailPreferencesSlice.reducer;
