declare interface RoleFitByClientSurvey extends Survey {
  clientOwnPersonalityPerceptions: string;              // Outgoing, Introverted, Optimistic, Pessimistic, Independent, Dependable, Other
  stressManagementPreference: string;                   // Tackling the problem directly, Seeking support from others, Preferring to avoid or escape from it, Other
  disagreementResolutionPreference: string;             // Communicate and compromise, Caregiver concedes to my wishes, Avoid conflict, Other
  generalInvolvementPreference: string;                 // Direct caregiver: assisting with daily activities, Financial manager: handling costs and budgets, Care coordinator: arranging services, Emotional support provider: offering comfort and companionship, Medical decision-maker: assuming healthcare proxy duties, Other or none
  rankedFactors: string;                                // Caregiver's familial obligations, Caregiver's job or career commitments, Geographical proximity to the caregiver, Your preferences, Severity of your health condition
  incentiveToAcceptCare: string;                        // If the caregiver lived nearby, If the caregiver lived far away, If I had financial means to pay for care, If I lacked financial resources for care
  willingnessToAcceptCare: string;                      // Fully willing and comfortable, Willing, but with some reservations, Reluctant, Highly resistant
  trustLevel: string;                                   // Very high level of trust, High level of trust, Moderate level of trust, Low level of trust, No trust
  currentCommunnicationFrequency: string;               // Daily, Weekly, Monthly, Rarely, Never
  emotionalCloseness: string;                           // Very emotionally close, Fairly emotionally close, Neutral, Not very emotionally close, Not at all emotionally close
  clientSpecificInvolvementPreference: string;          // Direct caregiver: assisting with daily activities, Financial manager: handling costs and budgets, Care coordinator: arranging services, Emotional support provider: offering comfort and companionship, Medical decision-maker: assuming healthcare proxy duties, Other or none
  willingnessToReceiveCare: string;                     // Fully willing and capable, Willing, but with some reservations, Capable, but with some reservations, Neither willing nor capable
  clientFinancialStability: string;                     // Very stable, Somewhat stable, Somewhat unstable, Very unstable
  previousExperience: string;                           // Extensive experience/knowledge, Some experience/knowledge, Little to no experience/knowledge
  potentialSupportProvider: string;                     // Other family members, Friends or neighbors, Community resources, No one at the moment
  relationshipCloseness: string;                        // Very close, Fairly close, Neutral, Somewhat distant, Very distant
  relationshipChangeComfortLevel: string;               // Very comfortable, Somewhat comfortable, Neutral, Somewhat uncomfortable, Very uncomfortable
  financialNeedConcernLevel: string;                    // Very concerned, Somewhat concerned, Neutral, Somewhat unconcerned, Not at all concerned
  receivingCareInterferenceLikelihood: string;          // Very likely, Somewhat likely, Neutral, Somewhat unlikely, Very unlikely
  physicalStressLevel: string;                          // Very high, Somewhat high, Neutral, Somewhat low, Very low
  emotionalStressLevel: string;                         // Very high, Somewhat high, Neutral, Somewhat low, Very low
  preferredSupportServices: string;                     // Home health care services, Adult day care services, Respite care services, Online or in-person support groups, Professional caregiving advice or consultation, I don't foresee needing any support services
  endOfLifeComfortLevel: string;                        // Very comfortable, Somewhat comfortable, Neutral, Somewhat uncomfortable, Very uncomfortable
  clientDecisionMakingInvolvement: string;              // Very much so, Somewhat, Not sure, Not really, Not at all
  setbackImpactLevel: string;                           // Very well, Fairly well, Neutral, Somewhat poorly, Very poorly
  clientPreparednessForDurationLevel: string;           // Very prepared, Somewhat prepared, Neutral, Somewhat unprepared, Very unprepared
  financialResponsibilityHandoverPreparedness: string;  // Fully capable, Somewhat capable, Will struggle, but can manage, Not capable
  stressCopingEffectivness: string;                     // I have effective coping strategies, I manage, but struggle sometimes, I often struggle with managing these feelings, I don't have any coping strategies
  consideredImpactOnOtherRelationships: string;         // Yes, and it won't significantly impact these relationships, Yes, and there may be some impact, I haven't considered this, This is a significant concern for me
  personalCareTaskComfortLevel: string;                 // Comfortable, Somewhat comfortable, Uncomfortable but willing to learn, Very uncomfortable
}
