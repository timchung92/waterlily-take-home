import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { initialState } from './initialState';

export type FeatureFlagKeys =
  | 'vbShop'
  | 'transamerica'
  | 'fortifiedLife'
  | 'newYorkLife'
  | 'ltciPartners';

type FeatureFlags = {
  [key in FeatureFlagKeys]: boolean;
};

const featureFlagsSlice = createSlice({
  name: 'featureFlags',
  initialState: initialState.featureFlags,
  reducers: {
    setFeatureFlag: (
      state,
      action: PayloadAction<{ featureName: FeatureFlagKeys; enabled: boolean }>,
    ) => {
      state.flags[action.payload.featureName] = action.payload.enabled;
    },
    setMultipleFeatureFlags: (state, action: PayloadAction<FeatureFlags>) => {
      state.flags = {
        ...state.flags,
        ...action.payload,
      };
    },
    resetFeatureFlags: state => {
      state.flags = initialState.featureFlags.flags;
    },
  },
});

export const { setFeatureFlag, setMultipleFeatureFlags, resetFeatureFlags } =
  featureFlagsSlice.actions;

export const featureFlagsReducer = featureFlagsSlice.reducer;
