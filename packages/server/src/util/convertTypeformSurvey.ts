import {
  newUuid,
  ExError,
  SurveyStatus,
  appModel,
  parseHeight,
  isDefined,
  logError,
} from '@shared';
import { ProcessSurveyProps } from './processSurvey';

interface AnswerValueConverter {
  (fieldName: string, value: unknown): unknown;
}

const answerValueConverters: ObjectMap<AnswerValueConverter> = {
  [appModel.tablesByName.surveyQuestions.valuesByLabel.clientHeightInches]:
    convertClientHeightInches,
};

export function convertTypeformToSurvey({
  typeformPayload,
  surveyDefinition,
  clientId,
  surveyId,
  supportProviderId,
}: ProcessSurveyProps) {
  assertConsent(typeformPayload);

  const { surveyDefinitionId, surveySubmittedBy } = surveyDefinition;

  const survey = {
    surveyId,
    surveyVersionId: newUuid(),
    surveyVersionDateTime: new Date(),
    clientId,
    supportProviderId,
    surveyDefinition,
    surveyDefinitionId,
    surveyStatus: SurveyStatus.complete,
    lastPageSeen: 1000,
    surveySubmittedDateTime: new Date(),
    surveySubmittedBy,
  } as Survey;

  typeformPayload.form_response.answers.forEach(convertAnswer);

  // special case where on field gets duplicated in temporary situation until after Aquaman is released
  if (isDefined(survey['clientGender'])) {
    survey['clientGenderIdentity'] = [survey['clientGender']];
    survey['clientGenderAtBirth'] = survey['clientGender'];
    delete survey['clientGender'];
  }

  return survey;

  function convertAnswer(typeformAnswer: TypeformAnswer) {
    try {
      const { ref: fieldName } = typeformAnswer.field;
      const rawValue = extractAnswerValue(typeformAnswer);
      const convertedValue = convertAnswerValue(fieldName, rawValue);

      survey[fieldName] = convertedValue;
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
}

function assertConsent(typeformPayload: TypeformWebhookPayload) {
  console.log('Checking consent');

  let consented = false;

  const hiddenConsent = typeformPayload.form_response.hidden.consent;
  if (hiddenConsent) {
    consented = hiddenConsent === 'true' ? true : false;
  } else {
    const consentAnswer = typeformPayload.form_response.answers.find(answer =>
      answer.field.ref.endsWith('Consent'),
    ) as TypeformChoiceAnswer | undefined;
    console.log('consent answer', consentAnswer);
    consented = consentAnswer?.choice.label.startsWith('Yes');
  }

  if (consented) {
    console.log('YES, consented');
    return undefined;
  }

  console.log('NO, did not consent.');

  const {
    form_response: {
      definition: { id, title },
    },
  } = typeformPayload;
  // Todo: Need generic 'email' logging level for weird kind of stuff that are not errors
  // but we need to notify somebody
  logError(
    assertConsent,
    'Client DID NOT CONSENT to TypeForm survey. See metadata for advisor details. No client details recorded or logged.',
    {
      typeformFormId: id,
      typeformFormTitle: title,
    },
  );
}

export function extractAnswerValue(typeformAnswer: TypeformAnswer) {
  const { type } = typeformAnswer;
  switch (type) {
    case 'text':
    case 'email':
    case 'phone_number':
    case 'date':
    case 'number':
    case 'boolean':
      return typeformAnswer[type];

    case 'choice':
      return typeformAnswer.choice.label;

    case 'choices':
      if (typeformAnswer.choices.other && typeformAnswer.choices.labels) {
        return [...typeformAnswer.choices.labels, typeformAnswer.choices.other];
      }
      if (typeformAnswer.choices.other && !typeformAnswer.choices.labels) {
        return [typeformAnswer.choices.other];
      }
      return typeformAnswer.choices.labels;

    default:
      throw new ExError('Unexpected Typeform answer type.', {
        typeformAnswer,
      });
  }
}

export function convertAnswerValue(fieldName: string, value: unknown) {
  const converter = answerValueConverters[fieldName];
  return converter === undefined ? value : converter(fieldName, value);
}

function convertClientHeightInches(
  _fieldName: string,
  value: unknown,
): unknown {
  return parseHeight(value as string);
}
