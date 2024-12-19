import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { ApiExError } from '@shared';

const advisorSlice = createSlice({
  name: 'advisor',
  initialState: initialState.advisor,
  reducers: {
    fetchAdvisorByAdvisorIdRequest(_state, _action: PayloadAction<string>) {
      return initialState.advisor;
    },
    fetchAdvisorByAdvisorIdResponse(state, action: PayloadAction<Advisor>) {
      state.data = action.payload;
    },
    fetchAdvisorByAdvisorIdFailure(_state, _action: PayloadAction<ApiExError>) {
      return initialState.advisor;
    },
    putAdvisorByAdvisorIdRequest(_state, _action: PayloadAction<Advisor>) {
      return initialState.advisor;
    },
    putAdvisorByAdvisorIdResponse(state, action: PayloadAction<Advisor>) {
      state.data = action.payload;
    },
    putAdvisorByAdvisorIdFailure(_state, _action: PayloadAction<ApiExError>) {
      return initialState.advisor;
    },
    resetAdvisorSettings(state) {
      state.advisorSettings.isLoading = false;
      state.advisorSettings.status = null;
    },
    postAdvisorUpdatesByAdvisorIdRequest(
      state,
      _action: PayloadAction<AdvisorProfile>,
    ) {
      state.advisorSettings.isLoading = true;
      state.advisorSettings.status = null;
    },
    postAdvisorUpdatesByAdvisorIdResponse(
      state,
      action: PayloadAction<Advisor>,
    ) {
      state.data = action.payload;
      state.advisorSettings.isLoading = false;
      state.advisorSettings.status = 'complete';
    },
    postAdvisorUpdatesByAdvisorId(state, _action: PayloadAction<ApiExError>) {
      state.advisorSettings.isLoading = false;
      state.advisorSettings.status = 'error';
    },
    resetAdvisorUpdatesStatus(state, action: PayloadAction<AdvisorUpdateKeys>) {
      state.advisorUpdates[action.payload] = null;
    },
    resetSendMagicLinkState(state) {
      state.advisorUpdates.sendMagicLink = null;
    },
    putMagicLinkEmailToClientRequest(
      state,
      _action: PayloadAction<CreateMagicLinkParams>,
    ) {
      state.advisorUpdates.sendMagicLink = 'loading';
    },
    putMagicLinkEmailToClientResponse(state, action: PayloadAction<MagicLink>) {
      if (action.payload.status === 'unsubscribed') {
        state.advisorUpdates.sendMagicLink = 'unsubscribed';
      } else {
        state.advisorUpdates.sendMagicLink = 'complete';
      }
    },
    putMagicLinkEmailToClientFailure(
      state,
      _action: PayloadAction<ApiExError>,
    ) {
      state.advisorUpdates.sendMagicLink = 'error';
    },
  },
});

export const {
  fetchAdvisorByAdvisorIdRequest,
  fetchAdvisorByAdvisorIdResponse,
  fetchAdvisorByAdvisorIdFailure,
  putAdvisorByAdvisorIdRequest,
  putAdvisorByAdvisorIdResponse,
  putAdvisorByAdvisorIdFailure,
  postAdvisorUpdatesByAdvisorIdRequest,
  postAdvisorUpdatesByAdvisorIdResponse,
  postAdvisorUpdatesByAdvisorId,
  putMagicLinkEmailToClientRequest,
  putMagicLinkEmailToClientResponse,
  putMagicLinkEmailToClientFailure,
  resetAdvisorSettings,
  resetSendMagicLinkState,
  resetAdvisorUpdatesStatus,
} = advisorSlice.actions;

export const advisorReducer = advisorSlice.reducer;
