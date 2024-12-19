import { hasOwnProperty } from './hasOwnProperty';
import {
  SupportProviderContribution,
  SupportProviderType,
  surveyQuestionTypeByQuestionRef,
} from './appModel';
import { isDefined } from './isDefined';
import { isNullUndefinedOrEmpty } from './isNullUndefinedOrEmpty';
import { logFatal, logOnceFatal } from './log';
import { RoleFitRanking } from './RoleFitRanking';
import { surveyDefinitions } from './surveyDefinitions';
import { toObjectMap } from './toObjectMap';

export interface ContributionFit {
  roleFitRanking: RoleFitRanking;
  contributionFitReason: string;
}

export type ContributionFitAnalysis =
  | {
      supportProvider: SupportProvider;
      fitByContribution: Record<SupportProviderContribution, ContributionFit>;
      todo: null;
    }
  | {
      supportProvider: SupportProvider;
      fitByContribution: null;
      todo: Todo;
    };

export function calcContributionFitAnalysis(
  supportProviderSet: SupportProviderSet | null,
  surveys: Survey[],
  todos: Todo[],
) {
  if (supportProviderSet === null) {
    return [];
  }

  const supportProviderAnalysis = supportProviderSet.supportProviders
    .filter(
      ({ supportProviderType }) =>
        supportProviderType !== SupportProviderType.professional,
    )
    .map(supportProvider =>
      calcContributionFitAnalysisForSupportProvider(
        supportProvider,
        surveys.filter(
          survey =>
            survey.supportProviderId === supportProvider.supportProviderId,
        ),
        todos,
      ),
    )
    .filter(isDefined);

  return supportProviderAnalysis;
}

function calcContributionFitAnalysisForSupportProvider(
  supportProvider: SupportProvider,
  surveys: Survey[] | undefined,
  todos: Todo[],
): ContributionFitAnalysis | null {
  if (isNullUndefinedOrEmpty(surveys)) {
    const todo = todos.find(
      todo =>
        todo.supportProvider?.supportProviderId ===
          supportProvider.supportProviderId &&
        todo.surveyDefinition.surveyDefinitionId ===
          surveyDefinitions.roleFitByClient.surveyDefinitionId,
    );

    if (todo === undefined) {
      logOnceFatal(
        calcContributionFitAnalysisForSupportProvider,
        'Attempting to calculate contribution fit for support provider that does not have surveys but also does not have the appropriate todo item.',
        {
          supportProvider,
          todos,
        },
        undefined,
        `calc-fit-missing-todo-${supportProvider.supportProviderId}`,
      );
      return null;
    }
    return {
      supportProvider,
      fitByContribution: null,
      todo,
    };
  }

  const fits = surveys.map(calcContributionFitScores);
  const fit = mergeRoleFitRankings(fits);

  const fitByContribution = (
    Object.entries(fit) as unknown as [
      SupportProviderContribution,
      RoleFitRanking,
    ][]
  ).reduce((merged, [contribution, roleFitRanking]) => {
    merged[contribution] = {
      roleFitRanking,
      contributionFitReason: calcContributionFitExplanation(
        contribution,
        roleFitRanking,
      ),
    };
    return merged;
  }, {} as Record<SupportProviderContribution, ContributionFit>);

  return {
    supportProvider,
    fitByContribution,
    todo: null,
  };
}

type Bumps = Record<SupportProviderContribution, number>;

function bumps(
  physicalBump: number,
  coordinatorBump: number,
  financialBump: number,
): Bumps {
  return {
    [SupportProviderContribution.physicalCaregiver]: physicalBump,
    [SupportProviderContribution.careCoordinator]: coordinatorBump,
    [SupportProviderContribution.financialCaregiver]: financialBump,
  };
}

const contributionFitQuestionBumps: Record<
  number,
  ObjectMap<ObjectMap<Bumps>>
> = {
  [surveyDefinitions.roleFitByClient.surveyDefinitionId]: {
    clientOwnPersonalityPerceptions: {
      Outgoing: bumps(1, 1, 1),
      Introverted: bumps(-1, -1, -1),
      Optimistic: bumps(1, 1, 1),
      Pessimistic: bumps(-1, -1, -1),
      Independent: bumps(1, 0, 0),
      Dependable: bumps(1, 2, 2),
      Other: bumps(0, 0, 0),
    },
    stressManagementPreference: {
      'Tackling the problem directly': bumps(2, 2, 2),
      'Seeking support from others': bumps(2, 2, 2),
      'Preferring to avoid or escape from it': bumps(1, 1, 1),
      'Other': bumps(0, 0, 0),
    },
    disagreementResolutionPreference: {
      'Communicate and compromise': bumps(2, 2, 2),
      'Caregiver concedes to my wishes': bumps(1, 1, 1),
      'Avoid conflict': bumps(1, 1, 1),
      'Other': bumps(0, 0, 0),
    },
    generalInvolvementPreference: {
      'Direct caregiver, assisting with daily activities': bumps(2, 0, 0),
      'Financial manager, handling costs and budgets': bumps(0, 0, 2),
      'Care coordinator, arranging services': bumps(0, 2, 1),
      'Emotional support provider, offering comfort and companionship': bumps(
        1,
        1,
        1,
      ),
      'Medical decision-maker, assuming healthcare proxy duties': bumps(
        1,
        2,
        2,
      ),
    },
    rankedFactors: {
      "Caregiver's familial obligations": bumps(1, 1, 1),
      "Caregiver's job or career commitments": bumps(1, 1, 1),
      'Geographical proximity to the caregiver': bumps(1, 1, 1),
      'Your preferences': bumps(2, 2, 2),
      'Severity of your health condition': bumps(2, 2, 2),
    },
    incentiveToAcceptCare: {
      'If the caregiver lived nearby': bumps(2, 2, 2),
      'If the caregiver lived far away': bumps(1, 1, 1),
      'If I had financial means to pay for care': bumps(1, 1, 2),
      'If I lacked financial resources for care': bumps(1, 1, 2),
    },
    willingnessToAcceptCare: {
      'Fully willing and comfortable': bumps(2, 2, 2),
      'Willing, but with some reservations': bumps(1, 2, 1),
      'Reluctant': bumps(-1, 1, 0),
      'Highly resistant': bumps(-2, 0, 0),
    },
    trustLevel: {
      'Very high level of trust': bumps(2, 2, 2),
      'High level of trust': bumps(1, 1, 1),
      'Moderate level of trust': bumps(0, 0, 0),
      'Low level of trust': bumps(-1, -1, -1),
      'No trust': bumps(-2, -2, -2),
    },
    currentCommunnicationFrequency: {
      Daily: bumps(2, 2, 1),
      Weekly: bumps(1, 1, 0),
      Monthly: bumps(0, 0, 0),
      Rarely: bumps(-1, -1, 0),
      Never: bumps(-2, -2, 0),
    },
    emotionalCloseness: {
      'Very emotionally close': bumps(2, 1, 0),
      'Fairly emotionally close': bumps(1, 0, 0),
      'Neutral': bumps(0, 0, 0),
      'Not very emotionally close': bumps(-1, 0, 0),
      'Not at all emotionally close': bumps(-2, 0, 0),
    },
    clientSpecificInvolvementPreference: {
      'Direct caregiver, assisting with daily activities': bumps(2, 0, 0),
      'Financial manager, handling costs and budgets': bumps(0, 0, 2),
      'Care coordinator, arranging services': bumps(0, 2, 1),
      'Emotional support provider, offering comfort and companionship': bumps(
        1,
        0,
        0,
      ),
      'Medical decision-maker, assuming healthcare proxy duties': bumps(
        1,
        1,
        0,
      ),
    },

    willingnessToReceiveCare: {
      'Fully willing and capable': bumps(2, 2, 2),
      'Willing, but with some reservations': bumps(1, 1, 1),
      'Capable, but with some reservations': bumps(0, 0, 0),
      'Neither willing nor capable': bumps(-1, -1, -1),
    },

    clientFinancialStability: {
      'Very stable': bumps(0, 0, 0),
      'Somewhat stable': bumps(0, 0, -1),
      'Somewhat unstable': bumps(0, 0, -2),
      'Very unstable': bumps(0, 0, -3),
    },
    previousExperience: {
      'Extensive experience/knowledge': bumps(2, 2, 2),
      'Some experience/knowledge': bumps(1, 1, 1),
      'Little to no experience/knowledge': bumps(0, 0, 0),
    },
    potentialSupportProvider: {
      'Other family members': bumps(0, 0, 0),
      'Friends or neighbors': bumps(0, 0, 0),
      'Community resources': bumps(0, 0, 0),
      'No one at the moment': bumps(-1, -1, -1),
    },
    relationshipCloseness: {
      'Very close': bumps(2, 1, 1),
      'Fairly close': bumps(1, 0, 0),
      'Neutral': bumps(0, 0, 0),
      'Somewhat distant': bumps(-1, -1, 0),
      'Very distant': bumps(-2, -2, -1),
    },
    relationshipChangeComfortLevel: {
      'Very comfortable': bumps(2, 1, 1),
      'Somewhat comfortable': bumps(1, 0, 0),
      'Neutral': bumps(0, 0, 0),
      'Somewhat uncomfortable': bumps(-1, -1, -1),
      'Very uncomfortable': bumps(-2, -2, -2),
    },
    financialNeedConcernLevel: {
      'Very concerned': bumps(0, 0, -2),
      'Somewhat concerned': bumps(0, 0, -1),
      'Neutral': bumps(0, 0, 0),
      'Somewhat unconcerned': bumps(0, 0, 1),
      'Not at all concerned': bumps(0, 0, 2),
    },
    receivingCareInterferenceLikelihood: {
      'Very likely': bumps(-2, -2, -2),
      'Somewhat likely': bumps(-1, -1, -1),
      'Neutral': bumps(0, 0, 0),
      'Somewhat unlikely': bumps(1, 1, 1),
      'Very unlikely': bumps(2, 2, 2),
    },
    physicalStressLevel: {
      'Very high': bumps(-2, -1, -1),
      'Somewhat high': bumps(-1, 0, 0),
      'Neutral': bumps(0, 0, 0),
      'Somewhat low': bumps(1, 1, 1),
      'Very low': bumps(2, 2, 2),
    },
    emotionalStressLevel: {
      'Very high': bumps(-2, -2, -2),
      'Somewhat high': bumps(-1, -1, -1),
      'Neutral': bumps(0, 0, 0),
      'Somewhat low': bumps(1, 1, 1),
      'Very low': bumps(2, 2, 2),
    },
    preferredSupportServices: {
      'Home health care services': bumps(1, 1, 0),
      'Adult day care services': bumps(1, 1, 0),
      'Respite care services': bumps(1, 1, 0),
      'Online or in-person support groups': bumps(1, 1, 0),
      'Professional caregiving advice or consultation': bumps(1, 1, 1),
      "I don't foresee needing any support services": bumps(-1, -1, -1),
    },
    endOfLifeComfortLevel: {
      'Very comfortable': bumps(2, 2, 2),
      'Somewhat comfortable': bumps(1, 1, 1),
      'Neutral': bumps(0, 0, 0),
      'Somewhat uncomfortable': bumps(-1, -1, -1),
      'Very uncomfortable': bumps(-2, -2, -2),
    },
    clientDecisionMakingInvolvement: {
      'Very much so': bumps(2, 2, 2),
      'Somewhat': bumps(1, 1, 1),
      'Not sure': bumps(0, 0, 0),
      'Not really': bumps(-1, -1, -1),
      'Not at all': bumps(-2, -2, -2),
    },
    setbackImpactLevel: {
      'Very well': bumps(2, 2, 2),
      'Fairly well': bumps(1, 1, 1),
      'Neutral': bumps(0, 0, 0),
      'Somewhat poorly': bumps(-1, -1, -1),
      'Very poorly': bumps(-2, -2, -2),
    },
    clientPreparednessForDurationLevel: {
      'Very prepared': bumps(2, 2, 2),
      'Somewhat prepared': bumps(1, 1, 1),
      'Neutral': bumps(0, 0, 0),
      'Somewhat unprepared': bumps(-1, -1, -1),
      'Very unprepared': bumps(-2, -2, -2),
    },
    financialResponsibilityHandoverPreparedness: {
      'Fully capable': bumps(1, 1, 2),
      'Somewhat capable': bumps(0, 0, 1),
      'Will struggle, but can manage': bumps(-1, -1, 0),
      'Not capable': bumps(-2, -2, -2),
    },
    stressCopingEffectivness: {
      'I have effective coping strategies': bumps(2, 2, 2),
      'I manage, but struggle sometimes': bumps(1, 1, 1),
      'I often struggle with managing these feelings': bumps(-1, -1, -1),
      "I don't have any coping strategies": bumps(-2, -2, -2),
    },
    consideredImpactOnOtherRelationships: {
      "Yes, and it won't significantly impact these relationships": bumps(
        2,
        2,
        2,
      ),
      'Yes, and there may be some impact': bumps(1, 1, 1),
      "I haven't considered this": bumps(0, 0, 0),
      'This is a significant concern for me': bumps(-2, -2, -2),
    },
    personalCareTaskComfortLevel: {
      'Comfortable': bumps(2, 1, 0),
      'Somewhat comfortable': bumps(1, 1, 0),
      'Uncomfortable but willing to learn': bumps(1, 0, 0),
      'Very uncomfortable': bumps(0, 0, 0),
    },
  },
  [surveyDefinitions.roleFitByCaregiver.surveyDefinitionId]: {
    supportProviderPersonality: {
      Outgoing: bumps(2, 2, 1),
      Introverted: bumps(1, 1, 2),
      Optimistic: bumps(2, 2, 2),
      Pessimistic: bumps(0, 0, 0),
      Independent: bumps(2, 2, 2),
      Dependable: bumps(2, 2, 2),
      Other: bumps(0, 0, 0),
    },
    supportProviderStressCopingPreference: {
      'I tackle the problem directly': bumps(2, 2, 1),
      'I seek support from others': bumps(2, 2, 2),
      'I prefer to avoid or escape from it': bumps(0, 0, 2),
      'Other': bumps(0, 0, 0),
    },
    supportProviderRelationshipWithClient: {
      'Very close': bumps(2, 2, 1),
      'Fairly close': bumps(2, 2, 2),
      'Neutral': bumps(1, 2, 2),
      'Not very close': bumps(1, 2, 2),
      'Distant': bumps(0, 1, 2),
    },
    supportProviderConflictResolutionWithCareRecipientPreferences: {
      'We communicate and compromise': bumps(2, 2, 2),
      'One of us usually concedes to the other': bumps(1, 1, 1),
      'We avoid conflict': bumps(0, 0, 1),
      'Other': bumps(0, 0, 0),
    },

    supportProviderToCareRecipientTrustLevel: {
      'Very high level of trust': bumps(2, 2, 2),
      'High level of trust': bumps(1, 1, 1),
      'Moderate level of trust': bumps(1, 1, 0),
      'Low level of trust': bumps(0, 0, 0),
      'No trust': bumps(0, 0, 0),
    },
    supportProviderCommunicationFrequency: {
      Daily: bumps(2, 2, 1),
      Weekly: bumps(1, 1, 1),
      Monthly: bumps(0, 1, 2),
      Rarely: bumps(0, 0, 1),
      Never: bumps(0, 0, 1),
    },

    supportProviderEmotionalClosenessLevel: {
      'Very emotionally close': bumps(2, 1, 0),
      'Fairly emotionally close': bumps(2, 1, 0),
      'Neutral': bumps(0, 2, 1),
      'Not very emotionally close': bumps(0, 1, 2),
      'Not at all emotionally close': bumps(0, 0, 2),
    },
    supportProviderSpecificInvolvementPreference: {
      'Direct caregiver, assisting with daily activities': bumps(2, 0, 0),
      'Financial manager, handling costs and budgets': bumps(0, 0, 2),
      'Care coordinator, arranging services': bumps(0, 2, 0),
      'Emotional support provider, offering comfort and companionship': bumps(
        2,
        0,
        0,
      ),
      'Medical decision-maker, assuming healthcare proxy duties': bumps(
        2,
        1,
        0,
      ),
    },

    supportProviderFactorPrioritization: {
      'Time availability': bumps(2, 2, 1),
      'Financial resources': bumps(1, 1, 2),
      'Emotional connection': bumps(2, 1, 0),
      'Geographic proximity': bumps(2, 2, 1),
      'Personal skills and abilities': bumps(2, 2, 1),
    },

    supportProviderValidCircumstancePreferences: {
      'Assisting with daily activities': bumps(2, 1, 0),
      'Providing financial support': bumps(0, 0, 2),
      'Coordinating care and appointments': bumps(0, 2, 1),
      'Offering emotional support and companionship': bumps(2, 1, 0),
      'Making medical decisions': bumps(2, 2, 0),
    },

    supportProviderCareWillingnessCapabilitiyComfortLevel: {
      'Fully willing and capable': bumps(2, 2, 2),
      'Willing, but with some reservations': bumps(1, 2, 2),
      'Capable, but with some reservations': bumps(2, 1, 1),
      'Neither willing nor capable': bumps(0, 0, 0),
    },

    supportProviderFinancialStabilityLevel: {
      'Very stable': bumps(2, 2, 2),
      'Somewhat stable': bumps(1, 1, 1),
      'Somewhat unstable': bumps(0, 0, 0),
      'Very unstable': bumps(0, 0, 0),
    },

    supportProviderExperienceLevel: {
      'Extensive experience/knowledge': bumps(2, 2, 2),
      'Some experience/knowledge': bumps(1, 1, 1),
      'Little to no experience/knowledge': bumps(0, 0, 0),
    },

    supportProviderSupportNetwork: {
      'Other family members': bumps(2, 2, 2),
      'Friends or neighbors': bumps(1, 1, 1),
      'Community resources': bumps(1, 1, 1),
      'No one at the moment': bumps(0, 0, 0),
    },

    supportProviderRelationshipToCareRecipient: {
      'Very close': bumps(2, 1, 0),
      'Fairly close': bumps(2, 1, 0),
      'Neutral': bumps(1, 1, 1),
      'Somewhat distant': bumps(0, 1, 2),
      'Very distant': bumps(0, 1, 2),
    },

    supportProviderHoursPerWeek: {
      'Less than 10 hours': bumps(0, 1, 2),
      '10-20 hours': bumps(1, 2, 1),
      '20-30 hours': bumps(2, 1, 0),
      'More than 30 hours': bumps(2, 0, 0),
    },

    supportProviderRelationshipForecast: {
      'Very comfortable': bumps(2, 2, 2),
      'Somewhat comfortable': bumps(1, 1, 1),
      'Neutral': bumps(0, 0, 0),
      'Somewhat uncomfortable': bumps(0, 0, 0),
      'Very uncomfortable': bumps(0, 0, 0),
    },

    supportProviderEmotionalStrainForecast: {
      'Very likely': bumps(0, 1, 2),
      'Somewhat likely': bumps(0, 1, 1),
      'Neutral': bumps(1, 1, 1),
      'Somewhat unlikely': bumps(2, 1, 0),
      'Very unlikely': bumps(2, 2, 0),
    },

    supportProviderFinancialWorryLevel: {
      'Very concerned': bumps(2, 2, 2),
      'Somewhat concerned': bumps(2, 2, 2),
      'Neutral': bumps(2, 2, 2),
      'Somewhat unconcerned': bumps(0, 0, 0),
      'Not at all concerned': bumps(0, 0, 0),
    },

    supportProviderCareInterferenceLevel: {
      'Very likely': bumps(2, 2, 2),
      'Somewhat likely': bumps(2, 2, 2),
      'Neutral': bumps(1, 1, 1),
      'Somewhat unlikely': bumps(0, 0, 0),
      'Very unlikely': bumps(0, 0, 0),
    },

    supportProviderPhysicalStressLevel: {
      'Very high': bumps(2, 2, 2),
      'Somewhat high': bumps(1, 1, 1),
      'Neutral': bumps(0, 0, 0),
      'Somewhat low': bumps(0, 0, 0),
      'Very low': bumps(0, 0, 0),
    },
    supportProviderEmotionalStressLevel: {
      'Very high': bumps(0, 1, 2),
      'Somewhat high': bumps(0, 1, 2),
      'Neutral': bumps(1, 2, 2),
      'Somewhat low': bumps(2, 2, 2),
      'Very low': bumps(2, 2, 2),
    },
    supportProviderDependentFamilyLevel: {
      'Yes, significantly': bumps(0, 1, 2),
      'Yes, somewhat': bumps(0, 2, 2),
      'Yes, but unlikely to impact': bumps(2, 2, 2),
      'No': bumps(2, 2, 2),
    },
    supportProviderChronicHealthIssueLevel: {
      'Yes, significantly': bumps(0, 1, 2),
      'Yes, somewhat': bumps(0, 2, 2),
      'Yes, but unlikely to impact': bumps(2, 2, 2),
      'No': bumps(2, 2, 2),
    },
    supportProviderMedicalFamiliarityLevel: {
      'Fully understand': bumps(2, 2, 2),
      'Understand to some extent': bumps(2, 2, 1),
      'Only know basic details': bumps(1, 1, 1),
      'Not very knowledgeable': bumps(0, 0, 1),
    },
    supportProviderTrainingComfortLevel: {
      'Very willing': bumps(2, 2, 2),
      'Somewhat willing': bumps(2, 2, 1),
      'Neutral': bumps(1, 1, 1),
      'Somewhat unwilling': bumps(0, 1, 1),
      'Very unwilling': bumps(0, 0, 0),
    },
    supportProviderSupportServiceComfortLevel: {
      'Home health care services': bumps(2, 2, 2),
      'Adult day care services': bumps(2, 2, 2),
      'Respite care services': bumps(2, 2, 2),
      'Online or in-person support groups': bumps(2, 2, 2),
      'Professional caregiving advice or consultation': bumps(2, 2, 2),
      "I don't foresee needing any support services": bumps(0, 0, 0),
    },
    supportProviderEndOfLiveComfortLevel: {
      'Very comfortable': bumps(2, 2, 2),
      'Somewhat comfortable': bumps(2, 2, 2),
      'Neutral': bumps(1, 1, 1),
      'Somewhat uncomfortable': bumps(1, 1, 1),
      'Very uncomfortable': bumps(0, 0, 0),
    },
    supportProviderDecisionMakingVoiceLevel: {
      'Very much so': bumps(1, 2, 2),
      'Somewhat': bumps(1, 2, 1),
      'Not sure': bumps(1, 1, 1),
      'Not really': bumps(1, 0, 0),
      'Not at all': bumps(0, 0, 0),
    },
    supportProviderSetbackComfortLevel: {
      'Very well': bumps(2, 2, 2),
      'Fairly well': bumps(2, 2, 2),
      'Neutral': bumps(1, 1, 1),
      'Somewhat poorly': bumps(0, 0, 0),
      'Very poorly': bumps(0, 0, 0),
    },
    supportProviderDurationComfortLevel: {
      'Very prepared': bumps(2, 2, 2),
      'Somewhat prepared': bumps(2, 2, 2),
      'Neutral': bumps(1, 1, 1),
      'Somewhat unprepared': bumps(0, 1, 1),
      'Very unprepared': bumps(0, 0, 0),
    },
    supportProviderFinancialResponsibilityComfortLevel: {
      'Fully capable': bumps(2, 2, 2),
      'Somewhat capable': bumps(2, 2, 2),
      'Will struggle, but can manage': bumps(1, 1, 1),
      'Not capable': bumps(0, 0, 0),
    },
    supportProviderAppreciationComfortLevel: {
      'Fully prepared': bumps(2, 2, 2),
      'Somewhat prepared': bumps(2, 2, 2),
      'I have not considered this': bumps(1, 1, 1),
      'Not prepared': bumps(0, 0, 0),
    },
    supportProviderOverwhelmPreferences: {
      'I have effective coping strategies': bumps(2, 2, 2),
      'I manage, but struggle sometimes': bumps(2, 2, 2),
      'I often struggle with managing these feelings': bumps(1, 1, 1),
      "I don't have any coping strategies": bumps(0, 0, 0),
    },
    supportProviderImpactToOtherRelationshipsComfortLevel: {
      "Yes, and it won't significantly impact these relationships": bumps(
        2,
        2,
        2,
      ),
      'Yes, and there may be some impact': bumps(1, 1, 1),
      "I haven't considered this": bumps(0, 0, 0),
      'This is a significant concern for me': bumps(0, 0, 0),
    },
    supportProviderPersonalCareTasksComfortLevel: {
      'Comfortable': bumps(2, 1, 0),
      'Somewhat comfortable': bumps(1, 1, 0),
      'Uncomfortable but willing to learn': bumps(1, 0, 0),
      'Very uncomfortable': bumps(0, 0, 0),
    },
    supportProviderHealthcareNavigationComfortLevel: {
      'Very ready': bumps(2, 2, 2),
      'Somewhat ready': bumps(2, 2, 1),
      'I could use more information': bumps(1, 1, 1),
      'Not ready': bumps(0, 0, 0),
    },
  },
};

type ContributionScoreThresholds = Record<SupportProviderContribution, number>; // technically same as bumps, but represents something very different so using unique type definition

/** recalculate based on  */
const contributionScoreThresholdsBySurveyDefinitionId: Record<
  number,
  ContributionScoreThresholds
> = {
  [surveyDefinitions.roleFitByClient.surveyDefinitionId]: {
    [SupportProviderContribution.physicalCaregiver]: 30,
    [SupportProviderContribution.careCoordinator]: 34,
    [SupportProviderContribution.financialCaregiver]: 36,
  },
  [surveyDefinitions.roleFitByCaregiver.surveyDefinitionId]: {
    [SupportProviderContribution.physicalCaregiver]: 41,
    [SupportProviderContribution.careCoordinator]: 45,
    [SupportProviderContribution.financialCaregiver]: 42,
  },
};

const contributionFitExplanations = {
  [SupportProviderContribution.physicalCaregiver]: {
    [RoleFitRanking.bestFit]: `
      A future care recipient in this category is open and comfortable with receiving hands- on care.
      Their adaptability, emotional receptiveness, and resilience align with the concepts in the
      Ecological Model of Aging and the Coping Model of User- Carer Relationship, facilitating a positive caregiving environment.
      `,

    [RoleFitRanking.moderateFit]: `
      Individuals here are somewhat comfortable with physical assistance but may experience emotional or
      psychological challenges in fully accepting this level of care.Enhancement in adaptability, building
      emotional resilience and establishing strong communication with caregivers are essential.
      `,

    [RoleFitRanking.poorFit]: `
      This fit signifies individuals who find it difficult to accept direct, hands - on care due to physical discomfort
      or emotional and psychological barriers.Implementing adaptive strategies and fostering emotional resilience,
      possibly through counseling or therapy, will be crucial to transitioning into this role.
      `,
  },

  [SupportProviderContribution.careCoordinator]: {
    [RoleFitRanking.bestFit]: `
      The individual is proactive and collaborative in care management, possessing strong communication and organizational;
      skills.The concepts of the Self - Determination Theory are reflected in their active participation, autonomy,
      and positive response to coordinated care supported by TCARE® protocol and Socio - Ecological Model.
      `,

    [RoleFitRanking.moderateFit]: `
      These individuals are somewhat involved in their care coordination but may need support in decision - making or
      navigating health systems.Strengthening communication and organizational skills, and enhancing patient advocacy,
      are pivotal to optimize their involvement in care coordination.
      `,

    [RoleFitRanking.poorFit]: `
      The future care recipients in this category may feel overwhelmed or passive in care coordination.Empowering
      these individuals through education, building self - advocacy skills, and ensuring support from professional care
      coordinators or family members is integral.
      `,
  },

  [SupportProviderContribution.financialCaregiver]: {
    [RoleFitRanking.bestFit]: `
      This category represents individuals who are informed, prepared, and have a well - structured plan for the financial
      aspects of their care.They are financially literate and proactive, ensuring that their financial affairs align with
      the anticipated needs and costs of future care.
      `,

    [RoleFitRanking.moderateFit]: `
      Future care recipients here have some level of financial preparation but might face uncertainties or gaps in planning;
      for comprehensive caregiving expenses.They would benefit from enhanced financial literacy and exploring diverse financial
      planning and support resources.
      `,

    [RoleFitRanking.poorFit]: `
      Individuals in this category may face significant uncertainties or lack preparation in managing the financial dimensions
      of receiving care.Engaging in financial literacy programs, seeking professional advice, and exploring available financial
      aids and supports is crucial to alleviate financial stress and ensure a well - supported caregiving journey.
      `,
  },
};

export function calcContributionFitScores(survey: Survey) {
  const questionBumps = contributionFitQuestionBumps[survey.surveyDefinitionId];
  const contributionScores = Object.entries(survey)
    .filter(([question, _answer]) =>
      hasOwnProperty(surveyQuestionTypeByQuestionRef, question),
    )
    .reduce(
      (cumulativeScores, [question, answer]) => {
        const answerScores = questionBumps[question];

        if (answerScores !== undefined) {
          const chosenBumps =
            answerScores[Array.isArray(answer) ? answer[0] : answer];
          if (chosenBumps !== undefined) {
            Object.entries(chosenBumps).forEach(([contribution, scoreBump]) => {
              cumulativeScores[contribution] += scoreBump;
            });
          } else {
            const {
              surveyId,
              surveyVersionId,
              surveyDefinitionId,
              clientId,
              supportProviderId,
            } = survey;

            logFatal(
              calcContributionFitScores,
              "Fatal development error occurred and survey has an answer that is not in the question's scoring matrix.",
              {
                question,
                unscoredAnswer: answer,
                availableAnswers: answerScores,
                surveyId,
                surveyVersionId,
                surveyDefinitionId,
                clientId,
                supportProviderId,
              },
            );
          }
        } else {
          const {
            surveyId,
            surveyVersionId,
            surveyDefinitionId,
            clientId,
            supportProviderId,
          } = survey;

          logFatal(
            calcContributionFitScores,
            'Fatal development error occurred and survey has a question that is not in the scoring matrix.',
            {
              unscoredQuestion: question,
              unscoredAnswer: answer,
              recognizedQuestions: Object.keys(questionBumps),
              surveyId,
              surveyVersionId,
              surveyDefinitionId,
              clientId,
              supportProviderId,
            },
          );
        }

        return cumulativeScores;
      },
      {
        [SupportProviderContribution.physicalCaregiver]: 0,
        [SupportProviderContribution.careCoordinator]: 0,
        [SupportProviderContribution.financialCaregiver]: 0,
      } as ObjectMap<number>,
    );
  return toObjectMap(
    Object.entries(contributionScores),
    ([contribution, _]) => contribution,
    ([contribution, score]) =>
      calcContributionFit(
        Number(contribution),
        score,
        contributionScoreThresholdsBySurveyDefinitionId[
          survey.surveyDefinitionId
        ],
      ),
  ) as Record<SupportProviderContribution, RoleFitRanking>;
}

function calcContributionFit(
  contribution: SupportProviderContribution,
  score: number,
  contributionScoreThresholds: ContributionScoreThresholds,
) {
  const topTwentyfivePercent = contributionScoreThresholds[contribution] * 0.75;
  const middleFiftyPercent = contributionScoreThresholds[contribution] * 0.25;

  return score >= topTwentyfivePercent
    ? RoleFitRanking.bestFit
    : score >= middleFiftyPercent
    ? RoleFitRanking.moderateFit
    : RoleFitRanking.poorFit;
}

function calcContributionFitExplanation(
  contribution: SupportProviderContribution,
  roleFitRanking: RoleFitRanking,
) {
  const explanation =
    contributionFitExplanations[contribution]?.[roleFitRanking];
  if (explanation !== undefined) {
    return explanation;
  }

  logFatal(
    calcContributionFitExplanation,
    'Fatal development error: Invalid call to retrieve a contribution fit explanation with a contribution and fit ranking that is not in the matrix.',
    {
      contribution,
      RoleFitRanking: roleFitRanking,
      availableExplanationKeys: Object.entries(contributionFitExplanations)
        .map(([contribution, fitExplanations]) => {
          const fits = Object.keys(fitExplanations).join(',');
          return `${contribution}:${fits}`;
        })
        .join('; '),
    },
  );
  return '';
}

function mergeRoleFitRankings(
  roleFitRankings: Record<SupportProviderContribution, RoleFitRanking>[],
) {
  if (roleFitRankings.length === 1) {
    return roleFitRankings[0];
  }

  return (
    Object.keys(roleFitRankings[0]) as unknown as SupportProviderContribution[]
  ).reduce((merged, contribution) => {
    const x = roleFitRankings[0][contribution];
    const y = roleFitRankings[1][contribution];
    merged[contribution] = x === y ? x : RoleFitRanking.moderateFit;
    return merged;
  }, {} as Record<SupportProviderContribution, RoleFitRanking>);
}
