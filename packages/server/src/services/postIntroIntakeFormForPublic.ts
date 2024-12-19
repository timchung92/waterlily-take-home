import {
  ApiExError,
  appModel,
  ExError,
  httpStatusCodes,
  logInfo,
  newClientId,
  newUuid,
  surveyDefinitions,
  SurveyStatus,
  ClientStatus,
  ClientTagDef,
} from '@shared';
import {
  ProcessSurveyProps,
  SafeSql,
  createNewClientSql,
  exists,
  extractAnswerValue,
  insertSql,
  insertSurveyAnswersSql,
  runQuery,
  selectAdvisorByAdvisorIdSql,
  selectClientBySurveyIdSql,
  selectOne,
} from 'src';

export async function postIntroIntakeFormForPublic({
  body,
}: BodyProps<TypeformWebhookPayload> & QueryStringParametersProps) {
  const formResponse = body?.form_response;
  let {
    hidden: { advisor_id: advisorId, survey_id: surveyId },
  } = formResponse;
  const surveyDefinitionId =
    surveyDefinitions.introIntakeForm.surveyDefinitionId;

  // validate that body has form_response
  if (!formResponse) {
    throw new ApiExError(
      httpStatusCodes.badRequest,
      'Invalid Typeform submission; body did not have a form_response.',
      {},
    );
  }

  // validate that response has valid advisor_id
  const advisor = await selectOne<Advisor>(
    selectAdvisorByAdvisorIdSql(advisorId),
  );
  if (!advisor) {
    throw new ApiExError(
      httpStatusCodes.badRequest,
      'Invalid Typeform submission; advisor_id not found.',
      {},
    );
  }

  const queries: SafeSql[] = [];

  // If client exists, check if survey already exists
  const client = await selectOne<Client>(selectClientBySurveyIdSql(surveyId));
  if (client) {
    // double check it's not duplicate submission
    const existingSurvey = await exists(
      appModel.tablesByName.surveys.tableName,
      {
        surveyId,
        clientId: client.clientId,
        surveyDefinitionId,
      },
    );
    if (existingSurvey) {
      logInfo(
        postIntroIntakeFormForPublic,
        'Ignoring duplicate intro intake form publication that has already been processed.',
        {
          advisorId,
          surveyId,
        },
      );
      return 'Ignored already processed duplicate';
    }
  }

  const clientId = client?.clientId ?? newClientId();
  const survey = {
    ...convertTypeformPayloadToIntakeSurvey({
      typeformPayload: body,
      surveyDefinition: surveyDefinitions.introIntakeForm,
      clientId,
      surveyId,
      supportProviderId: null,
    }),
  } as IntroIntakeSurvey;

  // If client does not exist, create new client
  if (!client) {
    const newClient = {
      clientId,
      advisorId,
      clientFirstName: survey.clientFirstName,
      clientLastName: survey.clientLastName,
      clientEmail: survey.clientEmail,
      clientAddedDateTime: new Date(),
      clientStatus: ClientStatus.active,
      clientTags: [
        appModel.tablesByName.clientTagDefs.labelsByValue[
          ClientTagDef.startedIntakeForm
        ],
      ],
      lastSlideSeen: 0,
      surveyId,
      planProgressPercent: 0.15,
    } as Client;

    queries.push(...createNewClientSql(newClient));
  }

  const insertSurveyQueries = [
    insertSql(appModel.tablesByName.surveys.tableName, survey, {
      skipReturning: true,
      expectedRowCountMin: 1,
      expectedRowCountMax: 1,
    }),
    ...insertSurveyAnswersSql(survey),
  ];

  queries.push(...insertSurveyQueries);
  await runQuery(queries);
}

function convertTypeformPayloadToIntakeSurvey({
  typeformPayload,
  surveyDefinition,
  clientId,
  surveyId,
}: ProcessSurveyProps) {
  const { surveyDefinitionId, surveySubmittedBy } = surveyDefinition;

  const survey = {
    surveyId,
    surveyVersionId: newUuid(),
    surveyVersionDateTime: new Date(),
    clientId,
    surveyDefinition,
    surveyDefinitionId,
    surveyStatus: SurveyStatus.complete,
    lastPageSeen: 1000,
    surveySubmittedDateTime: new Date(),
    surveySubmittedBy,
  } as Survey;

  typeformPayload.form_response.answers.forEach(convertAnswer);
  setContactInfoFieldNames();

  return survey;

  function convertAnswer(typeformAnswer: TypeformAnswer) {
    const surveyQuestionRefs =
      appModel.tablesByName.surveyQuestions.valuesByLabel;
    try {
      const { ref: fieldName } = typeformAnswer.field;
      const fieldValue = extractAnswerValue(typeformAnswer);
      let fieldKey = fieldName;
      // Contact info question type in Typeform does not accept block references,
      // so we have to create them manually
      if (!surveyQuestionRefs[fieldName]) {
        const title = typeformGetTitleByQuestionRef(typeformPayload, fieldName);
        let fieldNamePrefix = '' as ContactInfoPrefix;
        switch (title) {
          case 'First name':
            fieldNamePrefix = `FirstName`;
            break;
          case 'Last name':
            fieldNamePrefix = `LastName`;
            break;
          case 'Email':
            fieldNamePrefix = `Email`;
            break;
          case 'Phone number':
            fieldNamePrefix = `PhoneNumber`;
            break;
        }
        fieldKey = fieldNamePrefix
          ? `${fieldNamePrefix}.${fieldName}`
          : fieldName;
      }
      survey[fieldKey] = fieldValue;
    } catch (ex: unknown) {
      throw ExError.wrapOrAddMetadata(
        'Unable to convert Typeform answer.',
        {
          typeformAnswer,
        },
        ex,
      );
    }
  }

  function setContactInfoFieldNames() {
    const contactInfoFields: Record<ContactInfoPrefix, string[]> = {
      FirstName: [],
      LastName: [],
      Email: [],
      PhoneNumber: [],
    };

    // Group keys by ContactInfoPrefix
    for (const key of Object.keys(survey)) {
      const [prefix] = key.split('.'); // Get prefix part before the dot
      if (prefix in contactInfoFields) {
        contactInfoFields[prefix as ContactInfoPrefix].push(key);
      }
    }

    // Replace contact info keys with new keys
    for (const [prefix, keys] of Object.entries(contactInfoFields)) {
      keys.forEach((key, index) => {
        // assume first key is for the proxy and the second key is for the client
        // this depends on the typeform question order staying the same
        const newPrefix =
          keys.length === 1 ? 'client' : index === 0 ? 'proxy' : 'client';
        const newKey = `${newPrefix}${prefix}`;
        survey[newKey] = survey[key];
        delete survey[key];
      });
    }
  }
}

type ContactInfoPrefix = 'FirstName' | 'LastName' | 'Email' | 'PhoneNumber';

export function typeformGetTitleByQuestionRef(
  typeformPayload: TypeformWebhookPayload,
  ref: string,
): string | undefined {
  const field = typeformPayload.form_response.definition.fields.find(
    field => field.ref === ref,
  );
  return field?.title;
}
