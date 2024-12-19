import { createSlice } from '@reduxjs/toolkit';
import type { Action, AnyAction, PayloadAction } from '@reduxjs/toolkit';
import { initialState } from './initialState';

const slice = createSlice({
  name: 'activeApiActions',
  initialState: initialState.activeApiActions,
  reducers: {
    startApiAction(state, action: PayloadAction<Action<string>>) {
      return [...state, action];
    },
    endApiAction(state, action: PayloadAction<Action<string>>) {
      return state.filter(a => a !== action);
    },
  },
});

export const { startApiAction, endApiAction } = slice.actions;

export const activeApiActionsReducer = slice.reducer;
