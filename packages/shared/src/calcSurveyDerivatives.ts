import { Draft } from 'immer';
import { surveyDefinitions } from './surveyDefinitions';
import {
  CarePhase,
  customHiddenFieldQueryParamPrefix,
  isNullOrUndefined,
} from '@shared';
import { camelCase } from 'lodash';

export const activitiesOfDailyLiving = [
  'Bathing',
  'Eating',
  'Dressing',
  'Getting in/out of bed',
  'Toileting',
];

function calcActivitiesOfDailyLivingCount(
  clientActivitiesReceivedAssistanceList: string[],
) {
  return clientActivitiesReceivedAssistanceList.filter(activity =>
    activitiesOfDailyLiving.includes(activity),
  ).length;
}

function calculateAge(clientBirthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - clientBirthDate.getUTCFullYear();
  const m = today.getMonth() - clientBirthDate.getUTCMonth();
  if (m < 0 || (m === 0 && today.getDate() < clientBirthDate.getUTCDate())) {
    age--;
  }
  return age;
}

function mapAdlCountToCarePhase(
  clientAdlReceivedAssistanceCount: number,
): CarePhase | null {
  return clientAdlReceivedAssistanceCount >= 5
    ? CarePhase.fullCare
    : clientAdlReceivedAssistanceCount >= 3
      ? CarePhase.moderateCare
      : clientAdlReceivedAssistanceCount >= 1
        ? CarePhase.earlyCare
        : null;
}

function getNumberByRank(arr: number[], rank: number): number | null {
  if (rank < 1 || rank > arr.length) {
    // Handle invalid rank
    console.error('Rank out of bounds');
    return null;
  }

  const sortedArr = [...arr].sort();
  return sortedArr[rank - 1];
}

function calcPhaseStartAges(mutableClient: Draft<Client>) {
  const {
    intakeSurvey: {
      clientAgeReceivedHelpAccessingBed,
      clientAgeReceivedHelpBathing,
      clientAgeReceivedHelpDressing,
      clientAgeReceivedHelpEating,
      clientAgeReceivedHelpToileting,
    },
  } = mutableClient;

  const receivedHelpAges = [
    clientAgeReceivedHelpAccessingBed,
    clientAgeReceivedHelpBathing,
    clientAgeReceivedHelpDressing,
    clientAgeReceivedHelpEating,
    clientAgeReceivedHelpToileting,
    clientAgeReceivedHelpToileting, // counting twice b/c incontinence
  ].filter(age => age !== null) as number[];

  return {
    [CarePhase.earlyCare]: getNumberByRank(receivedHelpAges, 1),
    [CarePhase.moderateCare]: getNumberByRank(receivedHelpAges, 3),
    [CarePhase.fullCare]: getNumberByRank(receivedHelpAges, 5),
  };
}

function calcAdlDerivatives(
  intakeSurvey: IntakeSurvey,
  mutableClient: Draft<Client>,
) {
  intakeSurvey.clientAdlReceivedAssistanceCount =
    calcActivitiesOfDailyLivingCount(
      intakeSurvey.clientActivitiesReceivedAssistanceList,
    );

  // Has started LTC if they have received assistance with any ADL
  intakeSurvey.clientHasStartedLtc =
    intakeSurvey.clientAdlReceivedAssistanceCount > 0;

  intakeSurvey.clientCurrentCarePhase = mapAdlCountToCarePhase(
    intakeSurvey.clientAdlReceivedAssistanceCount,
  );
  intakeSurvey.clientPhaseStartAges = calcPhaseStartAges(mutableClient);
}

function addDefaultsForBackwardCompatibility(intakeSurvey: IntakeSurvey) {
  if (isNullOrUndefined(intakeSurvey.clientActivitiesReceivedAssistanceList)) {
    intakeSurvey.clientActivitiesReceivedAssistanceList = [];
  }

  if (isNullOrUndefined(intakeSurvey.clientZipCode)) {
    intakeSurvey.clientZipCode = '';
  }
}

export function calcSurveyDerivatives(mutableClient: Draft<Client>) {
  const { surveys } = mutableClient;
  surveys.forEach(
    survey =>
      (survey.surveyDefinition = surveyDefinitions[survey.surveyDefinitionId]),
  );

  const { surveyDefinitionId: intakeSurveyDefinitionId } =
    surveyDefinitions.intakeForm;

  const { surveyDefinitionId: introIntakeSurveyDefinitionId } =
    surveyDefinitions.introIntakeForm;

  let intakeSurvey = (mutableClient.intakeSurvey = surveys.find(
    survey => survey.surveyDefinitionId === intakeSurveyDefinitionId,
  ) as IntakeSurvey);

  mutableClient.introIntakeSurvey = surveys.find(
    survey => survey.surveyDefinitionId === introIntakeSurveyDefinitionId,
  ) as IntroIntakeSurvey;

  intakeSurvey = processCustomHiddenFields(intakeSurvey);
  addDefaultsForBackwardCompatibility(intakeSurvey);

  intakeSurvey.clientBirthYear = intakeSurvey.clientBirthDate.getUTCFullYear();
  intakeSurvey.clientAge = calculateAge(intakeSurvey.clientBirthDate);
  intakeSurvey.clientLtcZipCode = isNullOrUndefined(
    intakeSurvey.clientLtcZipCode,
  )
    ? intakeSurvey.clientZipCode
    : intakeSurvey.clientLtcZipCode;

  calcAdlDerivatives(intakeSurvey, mutableClient);
}

function processCustomHiddenFields(intakeSurvey: IntakeSurvey): IntakeSurvey {
  // Create an object to hold the removed entries
  const customHiddenFields: Record<string, string> = {};

  // Iterate over the original object and remove keys with the specified prefix
  Object.entries(intakeSurvey).forEach(([key, value]) => {
    if (key.startsWith(camelCase(customHiddenFieldQueryParamPrefix))) {
      customHiddenFields[key] = value;
    }
  });
  // Add the removed entries under the new key 'customHiddenFields'
  intakeSurvey['customHiddenFields'] = customHiddenFields;

  return intakeSurvey;
}
