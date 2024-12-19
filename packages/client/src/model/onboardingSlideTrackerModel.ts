import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { initialState } from './initialState';

const onboardingSlideTrackerSlice = createSlice({
  name: 'onboardingSlideTrackerModel',
  initialState: initialState.onboardingSlideTracker,
  reducers: {
    updateOnboardingSlideTracker(state, action: PayloadAction<number>) {
      if (state.currentSlideIndex === action.payload) {
        // If the current slide index is the same as the new slide index, do nothing
        return state;
      }

      if (action.payload < state.currentSlideIndex) {
        const currentNavigationSlide = state.slideHistory.lastIndexOf(
          action.payload,
        );
        state.previousSlideIndex =
          currentNavigationSlide === -1
            ? 0
            : state.slideHistory.findLast((item) => item < action.payload) ?? 0;
      } else {
        state.previousSlideIndex = state.currentSlideIndex;
      }

      state.currentSlideIndex = action.payload;
      state.slideHistory.push(action.payload);
      return state;
    },
  },
});

export const { updateOnboardingSlideTracker } =
  onboardingSlideTrackerSlice.actions;

export const onboardingSlideTrackerReducer =
  onboardingSlideTrackerSlice.reducer;
