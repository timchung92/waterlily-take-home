import { createSlice } from '@reduxjs/toolkit';
import type {
  Action,
  AnyAction,
  Dispatch,
  PayloadAction,
} from '@reduxjs/toolkit';
import {
  ApiExError,
  apiReponseErrorIncludes,
  calcClientDerivatives,
  isDefined,
  isNullOrUndefined,
} from '@shared';
import { initialState } from './initialState';
import {
  postAdvisorNewClientResponse,
  fetchClientsForAdvisorByAdvisorIdRequest,
} from './clientsModel';
import { AppState } from './store';
import { createSimpleMiddleware } from './createSimpleMiddleware';

const clientSlice = createSlice({
  name: 'client',
  initialState: initialState.client,
  reducers: {
    previewClientUpdates(state, { payload }: PayloadAction<Client>) {
      return {
        ...state,
        data: calcClientDerivatives(payload, state.clientPartner),
      };
    },
    fetchClientByClientIdRequest(state, action: PayloadAction<string>) {
      if (action.payload === state.data?.clientId) {
        return state;
      }
      state.isLoading = true;
    },
    fetchClientByClientIdResponse(
      state,
      _action: PayloadAction<ClientContainer>,
    ) {
      state.isLoading = false;
      // the catch-all reducer will get it below..
    },
    fetchClientByClientIdFailure(_state, _action: PayloadAction<ApiExError>) {
      return initialState.client;
    },
    putClientByClientIdRequest(_state, action: PayloadAction<Client>) {},
    putClientByClientIdResponse(
      _state,
      _action: PayloadAction<ClientContainer>,
    ) {},
    putClientByClientIdFailure(_state, _action: PayloadAction<ApiExError>) {
      return initialState.client;
    },

    putFundingSourcesForClientByClientIdRequest(
      state,
      {
        payload: { clientId, fundingSources },
      }: PayloadAction<PutFundingSourcesBodyProps>,
    ) {
      if (isDefined(state.data) && state.data.clientId === clientId) {
        state.data.fundingSources = fundingSources;
        state.data = calcClientDerivatives(state.data, state.clientPartner);
      }
      state.isLoading = true;
    },
    putFundingSourcesForClientByClientIdResponse(
      state,
      _action: PayloadAction<ClientContainer>,
    ) {
      state.isLoading = false;
    },
    putFundingSourcesForClientByClientIdFailure(
      state,
      _action: PayloadAction<ApiExError>,
    ) {
      state.isLoading = false;
      return initialState.client;
    },

    putPolicyFundingSourceForClientByClientIdRequest(
      state,
      {
        payload: { clientId, fundingSourceId, policyFundingSource },
      }: PayloadAction<PutPolicyFundingSourceByIdBodyProps>,
    ) {
      state.isLoading = true;
    },
    putPolicyFundingSourceForClientByClientIdResponse(
      state,
      _action: PayloadAction<ClientContainer>,
    ) {
      state.isLoading = false;
    },

    putPolicyFundingSourceForClientByClientIdFailure(
      state,
      _action: PayloadAction<ApiExError>,
    ) {
      state.isLoading = false;
      return initialState.client;
    },

    putSupportProviderSetForClientByClientIdRequest(
      state,
      {
        payload: { supportProviderSet },
      }: PayloadAction<PutSupportProviderSetBodyProps>,
    ) {
      return {
        ...state!,
        supportProviderSet,
      };
    },
    putSupportProviderSetForClientByClientIdResponse(
      _state,
      _action: PayloadAction<ClientContainer>,
    ) {},
    putSupportProviderSetForClientByClientIdFailure(
      _state,
      _action: PayloadAction<ApiExError>,
    ) {},

    deleteSupportProviderBySupportProviderIdForClientByClientIdRequest(
      _state,
      _action: PayloadAction<DeleteSupportProviderProps>,
    ) {},
    deleteSupportProviderBySupportProviderIdForClientByClientIdResponse(
      _state,
      _action: PayloadAction<ClientContainer>,
    ) {},
    deleteSupportProviderBySupportProviderIdForClientByClientIdFailure(
      _state,
      _action: PayloadAction<ApiExError>,
    ) {},

    postSurveysBySurveyIdRequest(_state, _action: PayloadAction<Survey[]>) {},
    postSurveysBySurveyIdResponse(
      _state,
      _action: PayloadAction<ClientContainer>,
    ) {},
    postSurveysBySurveyIdFailure(_state, _action: PayloadAction<ApiExError>) {},

    putCareEnvironmentSelectionsForClientByClientIdRequest(
      _state,
      _action: PayloadAction<PutCareEnvironmentSelectionsBodyProps>,
    ) {},
    putCareEnvironmentSelectionsForClientByClientIdResponse(
      _state,
      _action: PayloadAction<ClientContainer>,
    ) {},
    putCareEnvironmentSelectionsForClientByClientIdFailure(
      _state,
      _action: PayloadAction<ApiExError>,
    ) {},

    putClientCareEnvironmentCostsForClientByClientIdRequest(
      _state,
      _action: PayloadAction<PutClientCareEnvironmentCostsBodyProps>,
    ) {},
    putClientCareEnvironmentCostsForClientByClientIdResponse(
      _state,
      _action: PayloadAction<ClientContainer>,
    ) {},
    putClientCareEnvironmentCostsForClientByClientIdFailure(
      _state,
      _action: PayloadAction<ApiExError>,
    ) {},

    putClientCarePhaseDurationSelectionForClientByClientIdRequest(
      state,
      _action: PayloadAction<PutCarePhaseDurationSelectionBodyProps>,
    ) {
      state.clientUpdates.phaseDurations = 'loading';
    },
    putClientCarePhaseDurationSelectionForClientByClientIdResponse(
      state,
      _action: PayloadAction<ClientContainer>,
    ) {
      state.clientUpdates.phaseDurations = 'complete';
    },
    putClientCarePhaseDurationSelectionForClientByClientIdFailure(
      state,
      _action: PayloadAction<ApiExError>,
    ) {
      state.clientUpdates.phaseDurations = 'error';
    },
    putClientOnboardingSlideProgressByClientIdRequest(
      _state,
      _action: PayloadAction<ClientOnboardingSlideProgress>,
    ) {},
    putClientOnboardingSlideProgressByClientIdResponse(
      _state,
      _action: PayloadAction<ClientContainer>,
    ) {},
    putClientOnboardingSlideProgressByClientIdFailure(
      _state,
      _action: PayloadAction<ApiExError>,
    ) {},
    deleteClientByClientIdRequest(
      state,
      _action: PayloadAction<DeleteClientProps>,
    ) {
      state.isLoading = true;
    },
    deleteClientByClientIdResponse(state, action: PayloadAction<Advisor>) {
      state.isLoading = false;
    },
    deleteClientByClientIdFailure(state, _action: PayloadAction<ApiExError>) {
      state.isLoading = false;
      return initialState.client;
    },
    putClientPartnerLinkForClientByClientIdRequest(
      _state,
      action: PayloadAction<PutClientPartnerLinkBodyProps>,
    ) {},
    putClientPartnerLinkForClientByClientIdResponse(
      state,
      { payload: { client, clientPartner } }: PayloadAction<ClientContainer>,
    ) {
      if (client) {
        const newClientPartner = clientPartner
          ? calcClientDerivatives(clientPartner, null)
          : null;
        state.data = calcClientDerivatives(client, newClientPartner);
        state.clientPartner = newClientPartner;
      }
      state.isLoading = false;
    },
    putClientPartnerLinkForClientByClientIdFailure(
      _state,
      action: PayloadAction<ApiExError>,
    ) {
      return initialState.client;
    },
    putClientCustomInferencesForClientByClientIdRequest(
      state,
      _action: PayloadAction<PutClientCustomInferencesBodyProps>,
    ) {
      state.clientUpdates.ltcAtAge = 'loading';
      state.isLoading = true;
    },
    putClientCustomInferencesForClientByClientIdResponse(
      state,
      _action: PayloadAction<ClientContainer>,
    ) {
      state.clientUpdates.ltcAtAge = 'complete';
      state.isLoading = false;
    },
    putClientCustomInferencesForClientByClientIdFailure(
      state,
      _action: PayloadAction<ApiExError>,
    ) {
      state.clientUpdates.ltcAtAge = 'error';
      state.isLoading = false;
    },
    resetClientUpdatesStatus(state, action: PayloadAction<ClientUpdateKeys>) {
      state.clientUpdates[action.payload] = null;
      state.errorMessage = null;
    },
    postAdvisorMeetingRequestEmailRequest(
      state,
      _action: PayloadAction<AdvisorMeetingRequestEmailProps>,
    ) {
      state.clientUpdates.advisorMeetingRequest = 'loading';
    },
    postAdvisorMeetingRequestEmailResponse(
      state,
      _action: PayloadAction<string>,
    ) {
      state.clientUpdates.advisorMeetingRequest = 'complete';
    },
    postAdvisorMeetingRequestEmailFailure(
      state,
      _action: PayloadAction<ApiExError>,
    ) {
      state.clientUpdates.advisorMeetingRequest = 'error';
    },
    putClientTagsByClientIdRequest(
      _state,
      _action: PayloadAction<PutClientTagsBodyProps>,
    ) {},
    putClientTagsByClientIdResponse(
      _state,
      _action: PayloadAction<ClientContainer>,
    ) {},
    putClientTagsByClientIdFailure(
      _state,
      _action: PayloadAction<ApiExError>,
    ) {},
    putPartnerLinkRequestEmailRequest(
      state,
      _action: PayloadAction<PutPartnerLinkRequestEmailProps>,
    ) {
      state.clientUpdates.partnerLinkRequest = 'loading';
    },
    putPartnerLinkRequestEmailResponse(
      state,
      _action: PayloadAction<ClientContainer>,
    ) {
      state.clientUpdates.partnerLinkRequest = 'complete';
    },
    putPartnerLinkRequestEmailFailure(
      state,
      action: PayloadAction<ApiExError>,
    ) {
      state.clientUpdates.partnerLinkRequest = 'error';

      if (apiReponseErrorIncludes(action.payload, 'not found')) {
        state.errorMessage =
          'The account with the provided email address was not found for this advisor.';
      }
      if (apiReponseErrorIncludes(action.payload, 'multiple records')) {
        state.errorMessage =
          'There are multiple clients with that email address for this advisor. Please contact your advisor to    link the accounts for you.';
      }
      if (apiReponseErrorIncludes(action.payload, 'already linked')) {
        state.errorMessage =
          'The account with the provided email address is already linked to another client.';
      }
      if (apiReponseErrorIncludes(action.payload, 'no inference set')) {
        state.errorMessage =
          'The account with the provided email address has not submitted an intake form.';
      }
    },
    putClientCalculationSettingsByClientIdRequest(
      state,
      _action: PayloadAction<PutClientCalculationSettingsBodyProps>,
    ) {
      state.isLoading = true;
    },
    putClientCalculationSettingsByClientIdResponse(
      state,
      _action: PayloadAction<ClientContainer>,
    ) {
      state.isLoading = false;
    },
    putClientCalculationSettingsByClientIdFailure(
      state,
      _action: PayloadAction<ApiExError>,
    ) {
      state.isLoading = false;
    },
  },

  extraReducers(builder) {
    builder.addMatcher(
      (action: PayloadAction<ClientContainer>) => {
        const { payload } = action;
        return (
          !action.type.toLocaleLowerCase().includes('advisorhierarchy') &&
          !action.type.toLocaleLowerCase().includes('clientpartner') &&
          !action.type.toLocaleLowerCase().includes('advisoradminportal') &&
          action.type.endsWith('Response') &&
          isDefined(payload) &&
          'client' in payload &&
          isDefined(payload.client)
        );
      },
      (
        state,
        { payload: { client, clientPartner } }: PayloadAction<ClientContainer>,
      ) => {
        if (client) {
          const isDashboardClient = isNullOrUndefined(client.inferenceSet);
          const newClientPartner = clientPartner
            ? calcClientDerivatives(clientPartner, null)
            : null;
          state.data = isDashboardClient
            ? client
            : calcClientDerivatives(client, newClientPartner);
          state.clientPartner = newClientPartner;
        }

        if (state.isLoading === true) {
          state.isLoading = false;
        }
      },
    );
  },
});

/**
 * Middleware to invalidate & refetch clients list when a client is updated from the advisor dashboard
 */
function invalidateClientsMiddleWareImpl(
  dispatch: Dispatch<AnyAction>,
  getStore: () => AppState,
  next: Dispatch<AnyAction>,
  action: Action<string>,
) {
  next(action);

  if (
    action.type === putClientOnboardingSlideProgressByClientIdResponse.type ||
    action.type === putClientByClientIdResponse.type ||
    action.type === deleteClientByClientIdResponse.type ||
    action.type === putClientPartnerLinkForClientByClientIdResponse.type ||
    action.type === postAdvisorNewClientResponse.type
  ) {
    setTimeout(() => fetchNewClients(dispatch, getStore));
  }
}

export function fetchNewClients(
  dispatch: Dispatch<AnyAction>,
  getStore: () => AppState,
) {
  const advisor = getStore().session.advisor;
  if (isNullOrUndefined(advisor?.advisorId)) {
    return;
  }
  dispatch(
    fetchClientsForAdvisorByAdvisorIdRequest({
      advisorId: advisor!.advisorId,
      isInvalidation: true,
    }),
  );
}

export const invalidateClientsMiddleWare = createSimpleMiddleware(
  invalidateClientsMiddleWareImpl,
);

export const {
  previewClientUpdates,
  fetchClientByClientIdRequest,
  fetchClientByClientIdResponse,
  fetchClientByClientIdFailure,
  putClientByClientIdRequest,
  putClientByClientIdResponse,
  putClientByClientIdFailure,
  putFundingSourcesForClientByClientIdRequest,
  putFundingSourcesForClientByClientIdResponse,
  putFundingSourcesForClientByClientIdFailure,
  putPolicyFundingSourceForClientByClientIdRequest,
  putPolicyFundingSourceForClientByClientIdResponse,
  putPolicyFundingSourceForClientByClientIdFailure,
  putSupportProviderSetForClientByClientIdRequest,
  putSupportProviderSetForClientByClientIdResponse,
  putSupportProviderSetForClientByClientIdFailure,
  postSurveysBySurveyIdRequest,
  postSurveysBySurveyIdFailure,
  postSurveysBySurveyIdResponse,
  putCareEnvironmentSelectionsForClientByClientIdRequest,
  putCareEnvironmentSelectionsForClientByClientIdResponse,
  putCareEnvironmentSelectionsForClientByClientIdFailure,
  putClientCareEnvironmentCostsForClientByClientIdRequest,
  putClientCareEnvironmentCostsForClientByClientIdResponse,
  putClientCareEnvironmentCostsForClientByClientIdFailure,
  putClientCarePhaseDurationSelectionForClientByClientIdRequest,
  putClientCarePhaseDurationSelectionForClientByClientIdResponse,
  putClientCarePhaseDurationSelectionForClientByClientIdFailure,
  putClientOnboardingSlideProgressByClientIdRequest,
  putClientOnboardingSlideProgressByClientIdResponse,
  putClientOnboardingSlideProgressByClientIdFailure,
  deleteClientByClientIdRequest,
  deleteClientByClientIdResponse,
  deleteClientByClientIdFailure,
  putClientPartnerLinkForClientByClientIdRequest,
  putClientPartnerLinkForClientByClientIdResponse,
  putClientPartnerLinkForClientByClientIdFailure,
  putClientCustomInferencesForClientByClientIdRequest,
  putClientCustomInferencesForClientByClientIdResponse,
  putClientCustomInferencesForClientByClientIdFailure,
  resetClientUpdatesStatus,
  postAdvisorMeetingRequestEmailRequest,
  postAdvisorMeetingRequestEmailResponse,
  postAdvisorMeetingRequestEmailFailure,
  putClientTagsByClientIdRequest,
  putClientTagsByClientIdResponse,
  putClientTagsByClientIdFailure,
  putPartnerLinkRequestEmailRequest,
  putPartnerLinkRequestEmailResponse,
  putPartnerLinkRequestEmailFailure,
  putClientCalculationSettingsByClientIdRequest,
  putClientCalculationSettingsByClientIdResponse,
  putClientCalculationSettingsByClientIdFailure,
} = clientSlice.actions;

export const clientReducer = clientSlice.reducer;
