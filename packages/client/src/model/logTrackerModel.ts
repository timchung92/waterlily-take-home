import { createSlice } from '@reduxjs/toolkit';
import type { Action, PayloadAction } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { ApiExError, LogMessage, toObjectMap } from '@shared';

const logTrackerSlice = createSlice({
  name: 'logTracker',
  initialState: initialState.logTracker,
  reducers: {
    postLogMessageForPublicRequest(state, _action: PayloadAction<LogMessage[]>) {
      return state;
    },
    postLogMessageForPublicResponse(state, _action: Action) {
      return state;
    },
    postLogMessageForPublicFailure(state, _action: PayloadAction<ApiExError>) {
      return state;
    }
  }
});

export const {
  postLogMessageForPublicRequest,
  postLogMessageForPublicResponse,
  postLogMessageForPublicFailure
} = logTrackerSlice.actions;

export const logActionTypes = toObjectMap(
  Object.values(logTrackerSlice.actions),
  actionCreator => actionCreator.type,
  actionCreator => actionCreator.type
);

export function isLogAction(action: Action<string>) {
  return Boolean(logActionTypes[ action.type ]);
}

export const logTrackerReducer = logTrackerSlice.reducer;
