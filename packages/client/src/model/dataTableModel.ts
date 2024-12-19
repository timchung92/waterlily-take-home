// tableSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
} from '@tanstack/react-table';
import { initialState } from '.';

export interface TableState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  pagination: PaginationState;
  currentPage: number;
  selectedStatuses: string[];
}

export interface TableStateMap {
  [tableId: string]: TableState;
}

const dataTableSlice = createSlice({
  name: 'dataTable',
  initialState: initialState.dataTable,
  reducers: {
    setTableState: (
      state,
      action: PayloadAction<{
        tableId: string;
        tableState: Partial<TableState>;
      }>,
    ) => {
      const { tableId, tableState } = action.payload;
      state[tableId] = {
        ...state[tableId],
        ...tableState,
      };
    },
    clearTableState: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
    },
  },
});

export const { setTableState, clearTableState } = dataTableSlice.actions;
export const dataTableReducer = dataTableSlice.reducer;
