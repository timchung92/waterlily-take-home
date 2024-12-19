import {
  ApiExError,
  appModel,
  httpStatusCodes,
  surveyDefinitions,
  toBoolean,
  toRecord,
} from '@shared';
import {
  SupportProviderSetRow,
  gatherSupportProviderSetsWithSupportProviders,
  gatherSurveys,
  selectCareEnvironmentSelections,
  selectClientCareEnvironmentCosts,
  selectCarePhaseDurationSelections,
  selectClientsBy,
  selectFundingSourcesSql,
  selectInferenceSetSql,
  selectMany,
  selectOne,
  selectSimple,
  selectSupportProviderSetByClientIdSql,
  selectSurveysWithAnswers,
  selectClientCustomInferences,
  selectSimpleSql,
} from '../datastore';
import { isString } from 'lodash';

interface CareEnvironmentSelectionRow {
  careEnvironment: CareEnvironment;
  carePhase: CarePhase;
}

interface ClientCareEnvironmentCostSelectionRow {
  careEnvironment: CareEnvironment;
  rateAmount: number;
}

interface ClientCarePhaseDurationSelectionRow {
  carePhase: CarePhase;
  durationMonths: number;
}

export async function fetchClientByClientId(
  clientId: string,
  fetchedClients?: Set<string>,
): Promise<ClientContainer>;
export async function fetchClientByClientId(
  { clientId }: ClientIdProps,
  fetchedClients?: Set<string>,
): Promise<ClientContainer>;
export async function fetchClientByClientId(
  clientIdOrClientIdProps: ClientIdProps | string,
  fetchedClients?: Set<string>,
): Promise<ClientContainer> {
  const clientId = isString(clientIdOrClientIdProps)
    ? clientIdOrClientIdProps
    : clientIdOrClientIdProps.clientId;

  // This function is recursive now because we use it to also fetch client's partner,
  // so we need to keep track of fetched clients to prevent infinite recursion since
  // the partner's partner is the original client
  if (!fetchedClients) {
    fetchedClients = new Set();
  }
  if (fetchedClients.has(clientId)) {
    // Skipping fetch for already visited client
    return null;
  }
  // Mark the clientId as visited
  fetchedClients.add(clientId);

  const [
    client,
    surveys,
    inferenceSet,
    supportProviderSet,
    careEnvironmentSelectionsList,
    clientCareEnvironmentCostsList,
    carePhaseDurationSelectionsList,
    fundingSources,
    multipleFundingSources,
    onboardingSlideProgress,
    clientPartnerLinkDbRecord,
    clientCustomInferencesDbRecords,
    clientCalculationSettingsDbRecords,
  ] = await Promise.all([
    fetchClientImpl(),
    fetchSurveys(),
    fetchInferenceSet(),
    fetchSupportProviderSet(),
    fetchCareEnvironmentSelections(),
    fetchClientCareEnvironmentCosts(),
    fetchClientCarePhaseDurationSelections(),
    fetchFundingSources(),
    fetchMultipleFundingSources(),
    fetchClientOnboardingSlideProgress(),
    fetchClientPartnerLinkDbRecord(),
    fetchClientCustomInferencesDbRecords(),
    fetchClientCalculationSettingsDbRecords(),
  ]);

  if (client === undefined) {
    throw new ApiExError(
      httpStatusCodes.notFound,
      'Requested client not found.',
      {
        clientId,
      },
    );
  }

  const careEnvironmentSelections = toRecord(
    careEnvironmentSelectionsList,
    ({ carePhase }) => carePhase,
    ({ careEnvironment }) => careEnvironment,
  );

  const careEnvironmentCosts = toRecord(
    clientCareEnvironmentCostsList,
    ({ careEnvironment }) => careEnvironment,
    ({ rateAmount }) => rateAmount,
  );

  const carePhaseDurationSelections = toRecord(
    carePhaseDurationSelectionsList,
    ({ carePhase }) => carePhase,
    ({ durationMonths }) => durationMonths,
  );

  // Fetch the partner client if there is a partner client link
  const clientPartner = clientPartnerLinkDbRecord
    ? await fetchClientByClientId(
        clientPartnerLinkDbRecord.partnerClientId,
        fetchedClients,
      )
    : null;

  // convert clientCustomInferencesDbRecords to ClientCustomInferences
  const clientCustomInferences = clientCustomInferencesDbRecords.reduce(
    (acc, { inferenceLabel, inferenceValue }) => {
      acc[inferenceLabel] = Number(inferenceValue);
      return acc;
    },
    {} as ClientCustomInferences,
  );

  const clientCalculationSettings = clientCalculationSettingsDbRecords
    ? clientCalculationSettingsDbRecords.reduce(
        (acc, { settingLabel, settingValue, settingType }) => {
          acc[settingLabel] =
            settingType === 'boolean'
              ? toBoolean(settingValue)
              : settingType === 'number'
                ? Number(settingValue)
                : settingValue;
          return acc;
        },
        {} as ClientCalculationSettings,
      )
    : undefined;

  return {
    client: {
      ...client,
      surveys,
      inferenceSet,
      supportProviderSet,
      careEnvironmentSelections,
      careEnvironmentCosts,
      carePhaseDurationSelections,
      fundingSources,
      multipleFundingSources,
      onboardingSlideProgress,
      partnerClientId: clientPartnerLinkDbRecord?.partnerClientId ?? null,
      clientCustomInferences,
      clientCalculationSettings,
    },
    clientPartner: clientPartner ? clientPartner.client : null,
  } as ClientContainer;

  async function fetchClientImpl() {
    const clients = await selectClientsBy({ clientId });
    return clients.length === 0 ? undefined : (clients[0] as Client);
  }

  async function fetchSurveys() {
    const rows = await selectMany<Survey & SurveyAnswer & SurveyQuestion>(
      selectSurveysWithAnswers(
        clientId,
        Object.values(surveyDefinitions).map(def => def.surveyDefinitionId),
      ),
    );
    return gatherSurveys(rows);
  }

  async function fetchInferenceSet() {
    return (
      (await selectOne<InferenceSet>(selectInferenceSetSql(clientId))) ??
      undefined
    );
  }

  async function fetchSupportProviderSet() {
    const safeSql = selectSupportProviderSetByClientIdSql(clientId);
    const rows = await selectMany<SupportProviderSetRow>(safeSql);

    if (rows.length === 0) {
      return undefined;
    }

    const supportProviderSets =
      gatherSupportProviderSetsWithSupportProviders(rows);
    return supportProviderSets[0];
  }

  async function fetchCareEnvironmentSelections() {
    return await selectMany<CareEnvironmentSelectionRow>(
      selectCareEnvironmentSelections(clientId),
    );
  }

  async function fetchClientCareEnvironmentCosts() {
    return await selectMany<ClientCareEnvironmentCostSelectionRow>(
      selectClientCareEnvironmentCosts(clientId),
    );
  }

  async function fetchClientCarePhaseDurationSelections() {
    return await selectMany<ClientCarePhaseDurationSelectionRow>(
      selectCarePhaseDurationSelections(clientId),
    );
  }

  async function fetchMultipleFundingSources() {
    const rows = await selectMany<DbFundingSource & DbFundingSourceDetail>(
      selectFundingSourcesSql(clientId),
    );

    const fundingSources: ObjectMap<
      ObjectMap<ObjectMap<number | boolean | string>>
    > = {
      selfFunding: {},
      ltcPolicy: {},
      annuity: {},
    };

    async function setFundingSourceDetailValue(
      fundingSource: Object,
      fundingSourceDetailLabel: string,
      fundingSourceDetailValue: string,
    ) {
      fundingSource[fundingSourceDetailLabel] =
        /^(is|has)[A-Z]|\b(Is|Has)[A-Z]/.test(fundingSourceDetailLabel)
          ? toBoolean(fundingSourceDetailValue)
          : /^-?\d*\.?\d+$/.test(fundingSourceDetailValue)
            ? Number.parseFloat(fundingSourceDetailValue)
            : fundingSourceDetailValue;

      if (fundingSourceDetailLabel === 'addedByAdvisorId') {
        const advisor = await selectSimple<Advisor>(
          appModel.tableNames.advisors,
          { advisorId: fundingSourceDetailValue },
        );
        fundingSource['addedByAdvisorFullName'] =
          `${advisor.advisorFirstName} ${advisor.advisorLastName}`;
      }
    }

    rows.reduce(
      (
        acc,
        {
          fundingSourceId,
          fundingSourceLabel,
          fundingSourceDetailLabel,
          fundingSourceDetailValue,
        },
      ) => {
        if (!acc[fundingSourceLabel]) {
          acc[fundingSourceLabel] = {};
        }
        if (!acc[fundingSourceLabel][fundingSourceId]) {
          acc[fundingSourceLabel][fundingSourceId] = {};
        }

        setFundingSourceDetailValue(
          acc[fundingSourceLabel][fundingSourceId],
          fundingSourceDetailLabel,
          fundingSourceDetailValue,
        );

        return acc;
      },
      fundingSources,
    );
    return fundingSources as unknown as MultipleFundingSources;
  }

  async function fetchFundingSources() {
    const rows = await selectMany<DbFundingSource & DbFundingSourceDetail>(
      selectFundingSourcesSql(clientId),
    );

    const fundingSources: ObjectMap<ObjectMap<number | boolean | string>> = {
      selfFunding: {},
      ltcPolicy: {},
      annuity: {},
    };

    for (const {
      fundingSourceLabel,
      fundingSourceDetailLabel,
      fundingSourceDetailValue,
    } of rows) {
      const fundingSource =
        fundingSources[fundingSourceLabel] ??
        (fundingSources[fundingSourceLabel] = {});

      fundingSource[fundingSourceDetailLabel] =
        /^(is|has)[A-Z]|\b(Is|Has)[A-Z]/.test(fundingSourceDetailLabel)
          ? toBoolean(fundingSourceDetailValue)
          : /^-?\d*\.?\d+$/.test(fundingSourceDetailValue)
            ? Number.parseFloat(fundingSourceDetailValue)
            : fundingSourceDetailValue;

      if (fundingSourceDetailLabel === 'addedByAdvisorId') {
        const advisor = await selectSimple<Advisor>(
          appModel.tableNames.advisors,
          { advisorId: fundingSourceDetailValue },
        );
        fundingSource.addedByAdvisorFullName = `${advisor.advisorFirstName} ${advisor.advisorLastName}`;
      }
    }

    return fundingSources as unknown as FundingSources;
  }

  async function fetchClientOnboardingSlideProgress() {
    return selectSimple<ClientOnboardingSlideProgress>(
      appModel.tableNames.clientOnboardingSlideProgress,
      { clientId },
    );
  }

  async function fetchClientPartnerLinkDbRecord() {
    return selectSimple<ClientPartnerLinkDbRecord>(
      appModel.tableNames.clientPartnerLinks,
      { clientId },
    );
  }

  async function fetchClientCustomInferencesDbRecords() {
    return await selectMany<ClientCustomInferencesDbRecord>(
      selectClientCustomInferences(clientId),
    );
  }

  async function fetchClientCalculationSettingsDbRecords(): Promise<
    ClientCalculationSettingsDbRecord[]
  > {
    return await selectMany<ClientCalculationSettingsDbRecord>(
      selectSimpleSql(appModel.tableNames.clientCalculationSettings, {
        clientId,
      }),
    );
  }
}
