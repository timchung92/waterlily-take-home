import { Draft } from 'immer';
import { memoize } from 'lodash';
import { appModel, CareEnvironment, CarePhase } from './appModel';
import { carePhaseDefList } from './CarePhaseDef';
import { echo } from './echo';
import { isNullOrUndefined } from './isNullOrUndefined';
import { logOnceFatal } from './log';
import { toObjectMap } from './toObjectMap';

export function calcCareEnvironmentsDerivatives(mutableClient: Draft<Client>) {
  const { careEnvironmentSelections } = mutableClient;

  const recommendedCareEnvironments =
    (mutableClient.recommendedCareEnvironments = {} as Record<
      CarePhase,
      CareEnvironment
    >);
  const appliedCareEnvironments = (mutableClient.appliedCareEnvironments =
    {} as Record<CarePhase, CareEnvironment>);

  carePhaseDefList.forEach(({ value: carePhase }) => {
    recommendedCareEnvironments[carePhase] = recommendCareEnvironment(
      mutableClient,
      carePhase,
    );
    appliedCareEnvironments[carePhase] =
      careEnvironmentSelections[carePhase] ??
      recommendedCareEnvironments[carePhase];
  });
}

const questions = appModel.tablesByName.surveyQuestions.labelsByValue;

const preferenceQuestions = [
  questions.clientIndependencePreference,
  questions.clientFinancialSecurityPreference,
  questions.clientFamilyInvolvementPreference,
] as (keyof IntakeSurvey)[];

const independencePreferenceHome = 'home';
const independencePreferenceBalance = 'balances';
const independencePreferenceComprehensive = 'comprehensive';
const financialSecurityPreferenceAffordable = 'affordable';
const financialSecurityPreferenceBalance = 'balance';
const financialSecurityPreferenceBestcare = 'prioritize';
export const familyInvolvementPreferenceNone = 'no direct care'; // Treating no preference the same as minimal for care env recommendation
export const familyInvolvementPreferenceMinimal = 'minimal';
export const familyInvolvementPreferenceBalance = 'balance';
export const familyInvolvementPreferenceHeavily = 'heavily';

const recommendationsMatrix = [
  {
    [questions.clientIndependencePreference]: independencePreferenceHome,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceAffordable,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceMinimal,
    [CarePhase.earlyCare]: CareEnvironment.home,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceHome,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceAffordable,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceNone,
    [CarePhase.earlyCare]: CareEnvironment.home,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceHome,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceAffordable,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceBalance,
    [CarePhase.earlyCare]: CareEnvironment.home,
    [CarePhase.moderateCare]: CareEnvironment.home,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceHome,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceAffordable,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceHeavily,
    [CarePhase.earlyCare]: CareEnvironment.home,
    [CarePhase.moderateCare]: CareEnvironment.home,
    [CarePhase.fullCare]: CareEnvironment.home,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceHome,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBalance,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceMinimal,
    [CarePhase.earlyCare]: CareEnvironment.home,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceHome,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBalance,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceNone,
    [CarePhase.earlyCare]: CareEnvironment.home,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceHome,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBalance,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceBalance,
    [CarePhase.earlyCare]: CareEnvironment.home,
    [CarePhase.moderateCare]: CareEnvironment.home,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceHome,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBalance,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceHeavily,
    [CarePhase.earlyCare]: CareEnvironment.home,
    [CarePhase.moderateCare]: CareEnvironment.home,
    [CarePhase.fullCare]: CareEnvironment.home,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceHome,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBestcare,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceMinimal,
    [CarePhase.earlyCare]: CareEnvironment.home,
    [CarePhase.moderateCare]: CareEnvironment.home,
    [CarePhase.fullCare]: CareEnvironment.home,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceHome,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBestcare,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceNone,
    [CarePhase.earlyCare]: CareEnvironment.home,
    [CarePhase.moderateCare]: CareEnvironment.home,
    [CarePhase.fullCare]: CareEnvironment.home,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceHome,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBestcare,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceBalance,
    [CarePhase.earlyCare]: CareEnvironment.home,
    [CarePhase.moderateCare]: CareEnvironment.home,
    [CarePhase.fullCare]: CareEnvironment.home,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceHome,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBestcare,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceHeavily,
    [CarePhase.earlyCare]: CareEnvironment.home,
    [CarePhase.moderateCare]: CareEnvironment.home,
    [CarePhase.fullCare]: CareEnvironment.home,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceBalance,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceAffordable,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceMinimal,
    [CarePhase.earlyCare]: CareEnvironment.home,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceBalance,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceAffordable,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceNone,
    [CarePhase.earlyCare]: CareEnvironment.home,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceBalance,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceAffordable,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceBalance,
    [CarePhase.earlyCare]: CareEnvironment.home,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceBalance,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceAffordable,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceHeavily,
    [CarePhase.earlyCare]: CareEnvironment.home,
    [CarePhase.moderateCare]: CareEnvironment.home,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceBalance,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBalance,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceMinimal,
    [CarePhase.earlyCare]: CareEnvironment.independentLiving,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceBalance,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBalance,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceNone,
    [CarePhase.earlyCare]: CareEnvironment.independentLiving,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceBalance,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBalance,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceBalance,
    [CarePhase.earlyCare]: CareEnvironment.home,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceBalance,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBalance,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceHeavily,
    [CarePhase.earlyCare]: CareEnvironment.home,
    [CarePhase.moderateCare]: CareEnvironment.home,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceBalance,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBestcare,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceMinimal,
    [CarePhase.earlyCare]: CareEnvironment.independentLiving,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceBalance,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBestcare,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceNone,
    [CarePhase.earlyCare]: CareEnvironment.independentLiving,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceBalance,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBestcare,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceBalance,
    [CarePhase.earlyCare]: CareEnvironment.home,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]: independencePreferenceBalance,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBestcare,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceHeavily,
    [CarePhase.earlyCare]: CareEnvironment.home,
    [CarePhase.moderateCare]: CareEnvironment.home,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]:
      independencePreferenceComprehensive,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceAffordable,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceMinimal,
    [CarePhase.earlyCare]: CareEnvironment.independentLiving,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]:
      independencePreferenceComprehensive,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceAffordable,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceNone,
    [CarePhase.earlyCare]: CareEnvironment.independentLiving,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]:
      independencePreferenceComprehensive,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceAffordable,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceBalance,
    [CarePhase.earlyCare]: CareEnvironment.independentLiving,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]:
      independencePreferenceComprehensive,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceAffordable,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceHeavily,
    [CarePhase.earlyCare]: CareEnvironment.independentLiving,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]:
      independencePreferenceComprehensive,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBalance,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceMinimal,
    [CarePhase.earlyCare]: CareEnvironment.independentLiving,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]:
      independencePreferenceComprehensive,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBalance,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceNone,
    [CarePhase.earlyCare]: CareEnvironment.independentLiving,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]:
      independencePreferenceComprehensive,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBalance,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceBalance,
    [CarePhase.earlyCare]: CareEnvironment.independentLiving,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]:
      independencePreferenceComprehensive,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBalance,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceHeavily,
    [CarePhase.earlyCare]: CareEnvironment.home,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]:
      independencePreferenceComprehensive,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBestcare,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceMinimal,
    [CarePhase.earlyCare]: CareEnvironment.independentLiving,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]:
      independencePreferenceComprehensive,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBestcare,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceNone,
    [CarePhase.earlyCare]: CareEnvironment.independentLiving,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]:
      independencePreferenceComprehensive,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBestcare,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceBalance,
    [CarePhase.earlyCare]: CareEnvironment.independentLiving,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
  {
    [questions.clientIndependencePreference]:
      independencePreferenceComprehensive,
    [questions.clientFinancialSecurityPreference]:
      financialSecurityPreferenceBestcare,
    [questions.clientFamilyInvolvementPreference]:
      familyInvolvementPreferenceHeavily,
    [CarePhase.earlyCare]: CareEnvironment.independentLiving,
    [CarePhase.moderateCare]: CareEnvironment.assistedLiving,
    [CarePhase.fullCare]: CareEnvironment.fullCareFacility,
  },
];

const memoizedrecommendCareEnvironmentImpl = memoize(
  recommendCareEnvironmentImpl,
  memoizeKey,
);

export function recommendCareEnvironment(
  mutableClient: Client,
  carePhase: CarePhase,
): CareEnvironment {
  return memoizedrecommendCareEnvironmentImpl(mutableClient, carePhase);
}

function memoizeKey(mutableClient: Client, carePhase: CarePhase) {
  return `${mutableClient.clientId} ${mutableClient.cachedTimestamp?.valueOf()} ${carePhase}`;
}

function recommendCareEnvironmentImpl(
  mutableClient: Client,
  carePhase: CarePhase,
): CareEnvironment {
  const { intakeSurvey } = mutableClient;
  if (isNullOrUndefined(intakeSurvey)) {
    return CareEnvironment.home;
  }

  return (
    recommendationsMatrix.find(recommendation =>
      preferenceQuestions.every(question =>
        String(intakeSurvey[question]).includes(
          String(recommendation[question]),
        ),
      ),
    )?.[carePhase] ?? noRecommendationFound(intakeSurvey, carePhase)
  );
}

function noRecommendationFound(survey: IntakeSurvey, carePhase: CarePhase) {
  // Earlier version surveys could be missing these questions
  if (preferenceQuestions.every(question => survey[question] === undefined)) {
    return CareEnvironment.home;
  }

  logOnceFatal(
    noRecommendationFound,
    'This combination of preference questions did not result in any Care Environment recommendation. Returning home by default.',
    {
      carePhase,
      ...toObjectMap(preferenceQuestions, echo, question => survey[question]),
    },
    undefined,
    preferenceQuestions
      .map(question => `${question}_${survey[question]}`)
      .concat(appModel.tablesByName.carePhases.labelsByValue[carePhase])
      .join(),
  );

  return CareEnvironment.home;
}
