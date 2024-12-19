import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { ApiExError } from '@shared';

const advisorAdminPortalSlice = createSlice({
  name: 'advisorAdminPortal',
  initialState: initialState.advisorAdminPortal,
  reducers: {
    postAdvisorFieldUpdateByAdvisorIdRequest: (
      state,
      action: PayloadAction<AdvisorFieldUpdateProps>,
    ) => {
      state.status = 'loading';
      state.errorMessage = null;
      state.successMessage = null;
    },
    postAdvisorFieldUpdateByAdvisorIdResponse: (
      state,
      action: PayloadAction<string>,
    ) => {
      if (action.payload === 'Advisor not found') {
        state.errorMessage = action.payload;
        state.status = 'error';
      } else {
        state.status = 'success';
        state.successMessage = action.payload;
      }
    },
    postAdvisorFieldUpdateByAdvisorIdFailure: (
      state,
      action: PayloadAction<ApiExError>,
    ) => {
      state.errorMessage = 'An unknown error occurred';
      state.status = 'error';
    },
    resetAdvisorAdminPortal: state => {
      state.status = null;
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
});

export const {
  postAdvisorFieldUpdateByAdvisorIdRequest,
  postAdvisorFieldUpdateByAdvisorIdResponse,
  postAdvisorFieldUpdateByAdvisorIdFailure,
  resetAdvisorAdminPortal,
} = advisorAdminPortalSlice.actions;

export const advisorAdminPortalReducer = advisorAdminPortalSlice.reducer;
