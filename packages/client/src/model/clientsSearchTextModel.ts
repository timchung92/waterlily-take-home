import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { initialState } from './initialState';

const clientsSearchTextSlice = createSlice({
  name: 'clientsSearchText',
  initialState: initialState.clientsSearchText,
  reducers: {
    updateClientsSearchText(_state, action: PayloadAction<string>) {
      return action.payload ?? '';
    },
  }
});

export const { updateClientsSearchText } = clientsSearchTextSlice.actions;

export const clientsSearchTextReducer = clientsSearchTextSlice.reducer;
