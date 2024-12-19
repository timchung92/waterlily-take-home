import { Action, createSelector } from '@reduxjs/toolkit';
import { sortBy } from 'lodash';
import {
  assertNotNull,
  calcContributionFitAnalysis,
  emptyObject,
  fullName,
  initials,
  isFamily,
  isNullOrUndefined,
  isNullUndefinedOrEmpty,
  mapDefined,
  newUuid,
  nonLatinLettersRegex,
  standardizeSearchText,
  SupportProviderType,
  surveyDefinitions,
  TodoStatus,
} from '@shared';
import { AppState } from './store';
import { CognitoUser } from 'amazon-cognito-identity-js';
import UserPool from '../util/UserPool';

export function selectActiveApiActions(state: AppState) {
  return state.activeApiActions;
}

export const selectIsApiActionActive = createSelector(
  selectActiveApiActions,
  (_state, apiActionToCheck: Action<string>) => apiActionToCheck,
  (activeApiActions, apiActionToCheck) =>
    (activeApiActions as unknown[]).includes(apiActionToCheck),
);

export function selectPartialAdvisor(state: AppState) {
  return (state.advisor.data || emptyObject) as Partial<Advisor>;
}

export function selectAdvisorState(state: AppState) {
  return state.advisor;
}

export function selectAdvisorUpdatesStatus(state: AppState) {
  return state.advisor.advisorUpdates;
}

export function selectClients(state: AppState) {
  return state.clients.data;
}

export function selectClientsIsLoading(state: AppState) {
  return state.clients.isLoading;
}

export function selectClientIsInvalidating(state: AppState) {
  return state.clients.isInvalidating;
}

export function selectClientsSearchText(state: AppState) {
  return state.clientsSearchText;
}

export const selectClientsWithSearchableNames = createSelector(
  selectClients,
  clients =>
    clients?.map(client => ({
      client,
      searchableName: standardizeSearchText(
        client.clientFirstName,
        client.clientLastName,
      ),
    })),
);

export const selectClientsSearchResults = createSelector(
  selectClients,
  selectClientsWithSearchableNames,
  selectClientsSearchText,
  (clients, clientsWithSearchableNames, clientsSearchText) => {
    if (isNullUndefinedOrEmpty(clientsSearchText)) {
      return clients;
    }
    const searchTerms = clientsSearchText
      .toLocaleLowerCase()
      .split(nonLatinLettersRegex)
      .filter(term => term !== 'and' && term !== 'or' && term !== 'not');

    return mapDefined(
      clientsWithSearchableNames,
      ({ client, searchableName }) => {
        return searchTerms.some(term => searchableName.includes(term))
          ? client
          : undefined;
      },
    );
  },
);

export function selectMaybeClient(state: AppState) {
  return state.client.data ?? null;
}

export function selectClientDataExists(state: AppState) {
  return state.client.data !== null;
}

export function selectMaybeClientPartner(state: AppState) {
  return state.client.clientPartner ?? null;
}

export function selectClient(state: AppState) {
  return assertNotNull(state.client.data, 'state.null');
}

export function selectClientIsLoading(state: AppState) {
  return state.client.isLoading;
}

export function selectClientUpdatesStatus(state: AppState) {
  return state.client.clientUpdates;
}

export function selectClientErrorMessage(state: AppState) {
  return state.client.errorMessage;
}

export function selectPartialClient(state: AppState) {
  return (state.client.data || emptyObject) as Partial<Client>;
}

function createClientSelector<T>(
  fieldSelector: (client: Client) => T,
): ReturnType<typeof createSelector<[(state: AppState) => Client], T>> {
  return createSelector(selectClient, client => fieldSelector(client));
}

export const selectSurveys = createClientSelector(({ surveys }) => surveys);

export const selectSurveysAreLoaded = createSelector(
  selectMaybeClient,
  maybeClient => maybeClient !== null, // there is always an intake survey, so once loaded the array will never be blank
);

export const selectIntakeSurvey = createClientSelector(
  client => client.intakeSurvey,
);

export const selectInferenceSet = createClientSelector(
  ({ inferenceSet }) => inferenceSet,
);

export const selectAppliedInferenceSet = createClientSelector(
  ({ appliedInferenceSet }) => appliedInferenceSet,
);

export const selectSupportProviderSet = createClientSelector(
  ({ supportProviderSet }) => supportProviderSet,
);

export const selectFamilySupportProviders = createSelector(
  selectSupportProviderSet,
  supportProviderSet => supportProviderSet.supportProviders.filter(isFamily),
);

export const selectFundingSources = createClientSelector(
  ({ fundingSources }) => fundingSources,
);

export const selectSelfFundingSource = createSelector(
  selectFundingSources,
  ({ selfFunding }) => selfFunding,
);

export const selectSelfFundingContributionYears = createSelector(
  selectInferenceSet,
  selectSelfFundingSource,
  ({ ltcAtYear }, { contributionStartYear, contributionEndYear }) => [
    contributionStartYear ?? new Date().getFullYear(),
    contributionEndYear ?? ltcAtYear,
  ],
);

export const selectLtcPolicyFundingSource = createSelector(
  selectFundingSources,
  ({ ltcPolicy }) => ltcPolicy,
);

export const selectTodos = createSelector(selectClient, client => {
  const { supportProviderSet, surveys } = client;

  const todos = [] as Todo[];

  const supportProvidersThatGetSurveys =
    supportProviderSet.supportProviders.filter(
      sp => sp.supportProviderType !== SupportProviderType.professional,
    );

  supportProvidersThatGetSurveys.forEach((supportProvider, index) => {
    todos.push({
      client,
      supportProvider,
      surveyDefinition: surveyDefinitions.roleFitByClient,
      typeformPath: `https://waterlily.typeform.com/to/XZFNrD3P#advisor_id=${client.advisorId}&client_id=${client.clientId}&survey_id=${newUuid()}&support_provider_id=${supportProvider.supportProviderId}`,
      todoLabel: `${fullName(client)} needs to complete the Caregiver Role Fit survey for ${supportProvider.supportProviderName}.`,
      todoStatus: surveys.some(
        survey =>
          survey.surveyDefinitionId ===
            surveyDefinitions.roleFitByClient.surveyDefinitionId &&
          survey.supportProviderId === supportProvider.supportProviderId,
      )
        ? TodoStatus.completed
        : TodoStatus.outstanding,
      todoPriority: index + 2,
    });

    const needOrNeeds =
      supportProvider.supportProviderName === 'Children' ||
      supportProvider.supportProviderName === 'Other Family'
        ? 'need'
        : 'needs';

    todos.push({
      client,
      supportProvider,
      surveyDefinition: surveyDefinitions.roleFitByCaregiver,
      typeformPath: `https://waterlily.typeform.com/to/flK97Zux#advisor_id=${client.advisorId}&client_id=${client.clientId}&survey_id=${newUuid()}&support_provider_id=${supportProvider.supportProviderId}`,
      todoLabel: `${supportProvider.supportProviderName} ${needOrNeeds} to complete the Caregiver Role Fit survey for themself.`,
      todoStatus: surveys.some(
        survey =>
          survey.surveyDefinitionId ===
            surveyDefinitions.roleFitByCaregiver.surveyDefinitionId &&
          survey.supportProviderId === supportProvider.supportProviderId,
      )
        ? TodoStatus.completed
        : TodoStatus.outstanding,
      todoPriority: index + 1001,
    });
  });

  return sortBy(todos, todo => todo.todoPriority);
});

export const selectOutstandingTodos = createSelector(selectTodos, todos =>
  todos.filter(todo => todo.todoStatus === TodoStatus.outstanding),
);

export const selectCompletedTodos = createSelector(selectTodos, todos =>
  todos.filter(todo => todo.todoStatus === TodoStatus.completed),
);

export const selectContributionAnalysis = createSelector(
  selectSupportProviderSet,
  selectSurveys,
  selectTodos,
  (supportProviderSet, surveys, todos) =>
    isNullOrUndefined(supportProviderSet) ||
    isNullUndefinedOrEmpty(surveys) ||
    isNullUndefinedOrEmpty(todos)
      ? null
      : calcContributionFitAnalysis(supportProviderSet, surveys, todos),
);

export function selectSession(state: AppState) {
  return state.session;
}

export const selectSessionAdvisor = createSelector(
  selectSession,
  ({ advisor }) => assertNotNull(advisor, 'state.session.advisor'),
);

export const selectSessionFullName = createSelector(selectSession, session =>
  session === null ? '' : fullName(session),
);

export const selectSessionInitials = createSelector(selectSession, session =>
  session === null ? '' : initials(session),
);

export const selectMaybeSessionCognitoUser = createSelector(
  selectSession,
  session => {
    const user = new CognitoUser({
      Username: session?.advisor?.advisorEmail
        ? session?.advisor?.advisorEmail
        : '',
      Pool: UserPool,
    });
    return user ?? null;
  },
);

export const selectSessionPotentialNewAdvisor = createSelector(
  selectSession,
  session => session.potentialNewAdvisor,
);

export function selectMagicLinkSession(state: AppState) {
  return state.magicLinkSessionByToken;
}

export const selectMagicLinkSessionByToken = createSelector(
  selectMagicLinkSession,
  magicLinkSession => magicLinkSession,
);

export const selectMagicLinkIsLoading = (state: AppState) =>
  state.magicLinkSessionByToken.status === 'fetchingSession' ||
  state.magicLinkSessionByToken.status === 'sendingNew';

export function selectOnboardingSlideTracker(state: AppState) {
  return state.onboardingSlideTracker;
}

export const selectClientOnboardingSlideProgress = createSelector(
  selectClient,
  client => client.onboardingSlideProgress,
);

export function selectEmailPreferences(state: AppState) {
  return state.emailPreferences;
}

export function selectIntakeFormEmail(state: AppState) {
  return state.intakeFormEmail;
}

export function selectFeatureFlags(state: AppState) {
  return state.featureFlags.flags;
}

export function selectPolicyExtractor(state: AppState) {
  return state.policyExtractor;
}

export function selectDataTable(state: AppState) {
  return state.dataTable;
}

export function selectVerifyPartnerLinkRequestState(state: AppState) {
  return state.verifyPartnerLinkRequest;
}

export function selectAdvisorHierarchyState(state: AppState) {
  return state.advisorHierarchy;
}

export function selectClientCalculationSettings(state: AppState) {
  return state.client.data?.clientCalculationSettings ?? null;
}

export function selectAdvisorAdminPortalState(state: AppState) {
  return state.advisorAdminPortal;
}
