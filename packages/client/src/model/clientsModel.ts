import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { ApiExError } from '@shared';

interface FetchClientOptions {
  isInvalidation: boolean;
  advisorId: string;
}

const clientsSlice = createSlice({
  name: 'clients',
  initialState: initialState.clients,
  reducers: {
    fetchClientsForAdvisorByAdvisorIdRequest(
      state,
      action: PayloadAction<FetchClientOptions>,
    ) {
      if (action.payload.isInvalidation) {
        // This is a cache invalidation request, so we don't want to show the loading spinner.
        state.isInvalidating = true;
      } else {
        state.isLoading = true;
        state.data = initialState.clients.data;
      }
    },
    fetchClientsForAdvisorByAdvisorIdResponse(
      state,
      action: PayloadAction<Client[]>,
    ) {
      state.data = action.payload;
      state.isLoading = false;
      state.isInvalidating = false;
    },
    fetchClientsForAdvisorByAdvisorIdFailure(
      state,
      _action: PayloadAction<ApiExError>,
    ) {
      state.isLoading = false;
      state.isInvalidating = false;
      return initialState.clients;
    },
    postAdvisorNewClientRequest(
      _state,
      _action: PayloadAction<PostAdvisorNewClientBodyProps>,
    ) {},
    postAdvisorNewClientResponse(_state, _action: PayloadAction<Client>) {},
    postAdvisorNewClientFailure(_state, _action: PayloadAction<ApiExError>) {},
  },
});

export const {
  fetchClientsForAdvisorByAdvisorIdRequest,
  fetchClientsForAdvisorByAdvisorIdResponse,
  fetchClientsForAdvisorByAdvisorIdFailure,
  postAdvisorNewClientRequest,
  postAdvisorNewClientResponse,
  postAdvisorNewClientFailure,
} = clientsSlice.actions;

export const clientsReducer = clientsSlice.reducer;
