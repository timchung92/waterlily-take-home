import {
  ApiExError,
  ClientStatus,
  ClientTagDef,
  SupportProviderContribution,
  SupportProviderDetailSetSource,
  SupportProviderType,
  appModel,
  errorCauseChain,
  fullName,
  hasOwnProperty,
  hasValue,
  httpStatusCodes,
  isDefined,
  logInfo,
  newUuid,
  surveyDefinitions,
  zipCodeToState,
  customHiddenFieldQueryParamPrefix,
  newClientId,
} from '@shared';
import {
  SafeSql,
  createNewClientSql,
  insertSurveyAndAnswersSql,
  runQuery,
  selectClientBySurveyIdSql,
  selectIntakeSurveyCreatedAndInferencesRun,
  selectOne,
  updateClientTagsSql,
  updateSupportProviderSetSql,
  upsertSql,
} from '../datastore';
import { convertTypeformToSurvey } from '../util/convertTypeformSurvey';
import { createInferenceSet } from './createInferenceSet';
import createMagicLink from 'src/util/createMagicLink';
import { createMagicLinkEnabled } from 'src/util/serverConstants';
import { createAdvisorClientIntakeCompletedNotificationEmail } from 'src/util/email/createAdvisorClientIntakeCompletedNotificationEmail';
import { putIntakeFormPayload } from './putIntakeFormPayload';
import { camelCase } from 'lodash';

export async function postIntakeFormForPublic({
  body,
  queryStringParameters,
}: BodyProps<TypeformWebhookPayload> & QueryStringParametersProps) {
  const formResponse = body?.form_response;
  if (!formResponse) {
    throw new ApiExError(
      httpStatusCodes.badRequest,
      'Invalid Typeform submission; body did not have a form_response.',
      {},
    );
  }
  let {
    hidden: {
      advisor_id: advisorId,
      client_id: clientId,
      survey_id: surveyId,
      first_name: clientFirstName,
      last_name: clientLastName,
      should_send_client_email: shouldSendClientEmail,
      client_email: clientEmail,
      ...hiddenFields
    },
  } = formResponse;

  // custom hidden fields are prefixed with a customHiddenFieldQueryParamPrefix
  const customHiddenFields = Object.keys(hiddenFields)
    .filter(key => key.startsWith(customHiddenFieldQueryParamPrefix))
    .reduce(
      (acc, key) => {
        acc[camelCase(key)] = hiddenFields[key];
        return acc;
      },
      {} as { [key: string]: string },
    );

  // might replace with a query parameter or setting later
  const shouldCreateMagicLink = createMagicLinkEnabled
    ? shouldSendClientEmail === 'true'
    : false;

  // if we get a submission from the earlier form during transition, it will have
  // a bunch of stuff encoded in client_id, so we can validate this is the one
  // we care about if the client_id is blank (it will only have advisor_id and survey_id.
  if (hasValue(clientId)) {
    logInfo(
      postIntakeFormForPublic,
      'Ignoring Typeform submission since client_id has a value and we do not expect that field anymore.',
      {
        advisorId,
        clientId,
        surveyId,
      },
    );
    return 'Ignored submission with client_id';
  }

  // if this is an internal testing / dev submission, we need to assign a survey id
  if (surveyId === 'xxxxx') {
    surveyId = newUuid();
  }

  const maybeExisting = await selectOne<
    Partial<Pick<InferenceSet, 'inferenceSetId' | 'clientId'>>
  >(selectIntakeSurveyCreatedAndInferencesRun(surveyId));

  if (isDefined(maybeExisting?.inferenceSetId)) {
    logInfo(
      postIntakeFormForPublic,
      'Ignoring duplicate intake form publication that has already been processed.',
      {
        advisorId,
        surveyId,
        ...maybeExisting,
      },
    );
    return 'Ignored already processed duplicate';
  }

  const result = await processIntakeForm(
    body,
    advisorId,
    maybeExisting?.clientId,
    surveyId,
    clientFirstName,
    clientLastName,
    clientEmail,
    customHiddenFields,
  );
  if (shouldCreateMagicLink) {
    await createMagicLink({ clientId: result.clientId });
  }
  await createAdvisorClientIntakeCompletedNotificationEmail({
    advisorId,
    clientId: result.clientId,
  });
  return hasOwnProperty(queryStringParameters, 'inline') ? result : 'Completed';
}

async function processIntakeForm(
  typeformPayload: TypeformWebhookPayload,
  advisorId: string,
  clientId: string | undefined,
  surveyId: string,
  hiddenClientFirstName: string | undefined,
  hiddenClientLastName: string | undefined,
  hiddenClientEmail: string | undefined,
  customHiddenFields: { [key: string]: string },
) {
  // Store payload. Errors should not prevent the rest of the process.
  const typeformPayloadSubmissionId = newUuid();
  const typeformPayloadString = JSON.stringify(typeformPayload);
  try {
    putIntakeFormPayload({
      body: {
        typeformPayloadSubmissionId,
        typeformPayload: typeformPayloadString,
        clientId,
        advisorId,
        surveyId,
      },
    });
  } catch (ex: unknown) {
    logInfo(putIntakeFormPayload, 'Error inserting intake form payload.', {
      advisorId,
      clientId,
      surveyId,
      typeformPayloadSubmissionId,
      typeformPayloadString,
    });
  }

  const survey = {
    ...convertTypeformToSurvey({
      typeformPayload,
      surveyDefinition: surveyDefinitions.intakeForm,
      clientId,
      surveyId,
      supportProviderId: null,
    }),
    ...customHiddenFields,
  } as IntakeSurvey;

  survey.clientCensusRegion = zipCodeToState(survey.clientZipCode).censusRegion;

  const {
    clientFirstName: surveyClientFirstName,
    clientLastName: surveyClientLastName,
  } = survey;
  const clientFirstName = hiddenClientFirstName || surveyClientFirstName;
  const clientLastName = hiddenClientLastName || surveyClientLastName;

  const client = {
    clientId, // get's overridden before inserted
    advisorId,
    clientFirstName,
    clientLastName,
    clientEmail: hiddenClientEmail || survey.clientEmail,
    clientAddedDateTime: new Date(),
    clientStatus: ClientStatus.active,
    clientTags: [
      appModel.tablesByName.clientTagDefs.labelsByValue[
        ClientTagDef.algorithmsError
      ],
    ],
    lastSlideSeen: 0,
    planProgressPercent: 0.15,
  } as Client;

  await createClientAndSurvey(client, survey, typeformPayload, 2);
  clientId = client.clientId;

  // update the payload with the clientId
  try {
    putIntakeFormPayload({ body: { typeformPayloadSubmissionId, clientId } });
  } catch (ex: unknown) {
    logInfo(putIntakeFormPayload, 'Error updating intake form payload.', {
      advisorId,
      clientId,
      surveyId,
      typeformPayloadSubmissionId,
      typeformPayloadString,
    });
  }

  const queries = [] as SafeSql[];
  const inferenceSet = await createInferenceSet(
    client,
    survey as IntakeSurvey,
    queries,
  );

  const clientTagLabels = appModel.tablesByName.clientTagDefs.labelsByValue;
  const clientTagDefIds = [
    ClientTagDef.algorithmsFinishedRunning,
    ClientTagDef.startOnboarding,
  ];

  const afterClient = {
    ...client,
    planProgressPercent: 0.3,
    clientTags: clientTagDefIds.map(
      clientTagDefId => clientTagLabels[clientTagDefId],
    ),
  };

  queries.push(upsertSql(appModel.tableNames.clients, afterClient));
  updateClientTagsSql(client.clientId, clientTagDefIds).forEach(s =>
    queries.push(s),
  );

  const supportProviderSet = createSupportProviderSetForInferenceSet(
    client,
    survey as IntakeSurvey,
    inferenceSet,
    queries,
  );

  await runQuery(queries);

  const { inferenceSetId } = inferenceSet;
  const { supportProviderDetailSetId } = supportProviderSet;

  // returned value only shown/used in local development and on Typeform admin webhook delivery results
  return {
    clientId,
    surveyId,
    inferenceSetId,
    supportProviderDetailSetId,
  };
}

async function createClientAndSurvey(
  client: Client,
  survey: Survey,
  typeformPayload: TypeformWebhookPayload,
  clientIdRetries: number,
) {
  // check if client has already been created
  const maybeClient = await selectOne<
    Partial<Pick<Client, 'clientId' | 'surveyId'>>
  >(selectClientBySurveyIdSql(survey.surveyId));
  const clientExists = isDefined(maybeClient?.clientId);

  const clientId = maybeClient?.clientId ?? newClientId();
  const { surveyVersionId } = survey;
  const { advisorId, clientFirstName, clientLastName } = client;

  try {
    const start = performance.now();

    logInfo(
      createClientAndSurvey,
      'Creating new client and survey from intake form.',
      {
        advisorId,
        clientId,
        clientFirstName,
        clientLastName,
        surveyVersionId,
      },
    );

    client.clientId = clientId;
    survey.clientId = clientId;

    const createClientSql = createNewClientSql(client);
    const createSurveySql = [
      ...insertSurveyAndAnswersSql(survey, typeformPayload),
    ];
    const queries = clientExists
      ? createSurveySql
      : createClientSql.concat(createSurveySql);

    await runQuery(queries);

    const elapsedMs = Math.ceil(performance.now() - start);

    logInfo(
      createClientAndSurvey,
      'Created new client and survey from intake form.',
      {
        elapsedMs,
        advisorId,
        clientId,
        clientFirstName,
        clientLastName,
        surveyVersionId,
        client,
        survey,
      },
    );

    return { client, survey };
  } catch (ex: unknown) {
    // although very rare, it's possibe we'll create a duplicate clientId,
    // so check for that and retry in that case.
    const isDuplicateKeyError = errorCauseChain(ex)
      .map(cause => (cause instanceof Error ? cause.message : String(cause)))
      .some(cause => cause.includes('duplicate key'));

    if (isDuplicateKeyError && clientIdRetries > 0) {
      return createClientAndSurvey(
        client,
        survey,
        typeformPayload,
        clientIdRetries - 1,
      );
    }

    throw ApiExError.wrapApiOrAddMetadata(
      httpStatusCodes.internalServerError,
      'Error creating new client and survey.',
      {
        clientId,
        surveyVersionId,
      },
      ex,
    );
  }
}

function createSupportProviderSetForInferenceSet(
  client: Client,
  intakeSurvey: IntakeSurvey,
  inferenceSet: Partial<InferenceSet>,
  queries: SafeSql[],
) {
  const { clientId } = client;
  const supportProviderDetailSetId = newUuid();

  const {
    partnerHelperPercent,
    childHelperPercent,
    partnerCareHoursPreferred,
    professionalCareHoursPreferred,
    childrenCareHoursPreferred,
    otherFamilyCareHoursPreferred,

    phaseOneCareHoursRatio,
    phaseTwoCareHoursRatio,
    phaseThreeCareHoursRatio,
  } = inferenceSet;

  // TODO: Refactor to create all in one pass instead of four. https://www.notion.so/joinwaterlily/Calculate-initial-support-provider-list-in-one-pass-instead-of-four-f628b57a9242425ab6c61d2e0e93b8e3
  const supportProviders: Partial<SupportProvider>[] = [
    {
      supportProviderDetailSetId,
      supportProviderDetailId: newUuid(),
      supportProviderName: fullName(
        intakeSurvey.partnerFirstName,
        intakeSurvey.partnerLastName,
      ),
      supportProviderType: SupportProviderType.spouse,
      supportProviderPhaseOneHours: Math.round(
        partnerCareHoursPreferred * phaseOneCareHoursRatio,
      ),
      supportProviderPhaseTwoHours: Math.round(
        partnerCareHoursPreferred * phaseTwoCareHoursRatio,
      ),
      supportProviderPhaseThreeHours: Math.round(
        partnerCareHoursPreferred * phaseThreeCareHoursRatio,
      ),
    },
    {
      supportProviderDetailSetId,
      supportProviderDetailId: newUuid(),
      supportProviderName: 'Children',
      supportProviderType: SupportProviderType.child,
      supportProviderPhaseOneHours: Math.round(
        childrenCareHoursPreferred * phaseOneCareHoursRatio,
      ),
      supportProviderPhaseTwoHours: Math.round(
        childrenCareHoursPreferred * phaseTwoCareHoursRatio,
      ),
      supportProviderPhaseThreeHours: Math.round(
        childrenCareHoursPreferred * phaseThreeCareHoursRatio,
      ),
    },
    {
      supportProviderDetailSetId,
      supportProviderDetailId: newUuid(),
      supportProviderName: 'Other Family',
      supportProviderType: SupportProviderType.other,
      supportProviderPhaseOneHours: Math.round(
        otherFamilyCareHoursPreferred * phaseOneCareHoursRatio,
      ),
      supportProviderPhaseTwoHours: Math.round(
        otherFamilyCareHoursPreferred * phaseTwoCareHoursRatio,
      ),
      supportProviderPhaseThreeHours: Math.round(
        otherFamilyCareHoursPreferred * phaseThreeCareHoursRatio,
      ),
    },
    {
      supportProviderDetailSetId,
      supportProviderDetailId: newUuid(),
      supportProviderName: 'Professional Care Service',
      supportProviderType: SupportProviderType.professional,
      supportProviderPhaseOneHours: Math.round(
        professionalCareHoursPreferred * phaseOneCareHoursRatio,
      ),
      supportProviderPhaseTwoHours: Math.round(
        professionalCareHoursPreferred * phaseTwoCareHoursRatio,
      ),
      supportProviderPhaseThreeHours: Math.round(
        professionalCareHoursPreferred * phaseThreeCareHoursRatio,
      ),
    },
  ]
    .filter(member => {
      const hasHours =
        member.supportProviderPhaseOneHours ||
        member.supportProviderPhaseTwoHours ||
        member.supportProviderPhaseThreeHours;

      const isDirectlyIncludedType =
        member.supportProviderType === SupportProviderType.other ||
        member.supportProviderType === SupportProviderType.professional;

      const isSpouseWithHelperPercent =
        member.supportProviderType === SupportProviderType.spouse &&
        partnerHelperPercent > 0;
      const isChildWithHelperPercent =
        member.supportProviderType === SupportProviderType.child &&
        childHelperPercent > 0;

      return (
        hasHours ||
        isDirectlyIncludedType ||
        isSpouseWithHelperPercent ||
        isChildWithHelperPercent
      );
    })
    .map((member, index) => ({
      supportProviderId: newUuid(),
      clientId,
      ...member,
      supportProviderCareLevel:
        member.supportProviderType === SupportProviderType.professional
          ? 1
          : index + 1,
      supportProviderContribution:
        SupportProviderContribution.physicalCaregiver,
    }));

  const supportProviderSet: SupportProviderSet = {
    supportProviderDetailSetId,
    supportProviderDetailSetSource: SupportProviderDetailSetSource.inferences,
    clientId,
    removeFamilyBurden: false,
    supportProviders: supportProviders as SupportProvider[],
  };

  updateSupportProviderSetSql(supportProviderSet).forEach(safeSql =>
    queries.push(safeSql),
  );

  return supportProviderSet;
}
