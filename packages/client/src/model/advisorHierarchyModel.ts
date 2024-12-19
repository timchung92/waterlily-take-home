import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { ApiExError, apiReponseError, apiReponseErrorIncludes } from '@shared';

const advisorHierarchySlice = createSlice({
  name: 'advisorHierarchy',
  initialState: initialState.advisorHierarchy,
  reducers: {
    fetchSubordinateAdvisorsByAdvisorIdRequest(
      state,
      action: PayloadAction<AdvisorIdProps>,
    ) {},
    fetchSubordinateAdvisorsByAdvisorIdResponse(
      state,
      action: PayloadAction<Advisor[]>,
    ) {
      state.subordinateAdvisors = action.payload;
    },
    fetchSubordinateAdvisorsByAdvisorIdFailure(
      state,
      _action: PayloadAction<ApiExError>,
    ) {},
    postAdvisorHierarchyRelationshipRequest(
      state,
      _action: PayloadAction<PostAdvisorHierarchyRelationshipProps>,
    ) {
      state.status = 'loading';
      state.errorMessage = '';
    },
    postAdvisorHierarchyRelationshipResponse(
      state,
      action: PayloadAction<{ advisorId: string; action: 'create' | 'delete' }>,
    ) {
      state.status =
        action.payload.action === 'create'
          ? 'successfullyAddedRelationship'
          : 'successfullyDeletedRelationship';
      state.errorMessage = '';
    },
    postAdvisorHierarchyRelationshipFailure(
      state,
      action: PayloadAction<ApiExError>,
    ) {
      state.status = 'error';
      const errorMessage = apiReponseError(action.payload);
      if (apiReponseErrorIncludes(action.payload, 'not found')) {
        state.errorMessage = errorMessage;
      } else if (
        apiReponseErrorIncludes(
          action.payload,
          'exact relationship already exists',
        )
      ) {
        state.errorMessage = 'This relationship already exists.';
      } else if (
        apiReponseErrorIncludes(
          action.payload,
          'reverse relationship already exists',
        )
      ) {
        state.errorMessage = 'The reverse relationship already exists.';
      } else if (
        apiReponseErrorIncludes(action.payload, 'no relationship exists')
      ) {
        state.errorMessage = 'No relationship exists between these advisors.';
      } else {
        state.errorMessage =
          'An unknown error occurred. Please try again or contact support.';
      }
    },
  },
});

export const {
  fetchSubordinateAdvisorsByAdvisorIdRequest,
  fetchSubordinateAdvisorsByAdvisorIdResponse,
  fetchSubordinateAdvisorsByAdvisorIdFailure,
  postAdvisorHierarchyRelationshipRequest,
  postAdvisorHierarchyRelationshipResponse,
  postAdvisorHierarchyRelationshipFailure,
} = advisorHierarchySlice.actions;

export const advisorHierarchyReducer = advisorHierarchySlice.reducer;
