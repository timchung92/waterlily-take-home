declare interface RoleFitBySupportProviderSurvey extends Survey {
  supportProviderPersonality: string;                                     // Outgoing, Introverted, Optimistic, Pessimistic, Independent, Dependable, Other
  supportProviderStressCopingPreference: string;                          // I tackle the problem directly, I seek support from others, I prefer to avoid or escape from it, Other
  supportProviderRelationshipWithClient: string;                          // Very close, Fairly close, Neutral, Not very close, Distant
  supportProviderConflictResolutionWithCareRecipientPreferences: string;  // We communicate and compromise, One of us usually concedes to the other, We avoid conflict, Other
  supportProviderToCareRecipientTrustLevel: string;                       // Very high level of trust, High level of trust, Moderate level of trust, Low level of trust, No trust
  supportProviderCommunicationFrequency: string;                          // Daily, Weekly, Monthly, Rarely, Never
  supportProviderEmotionalClosenessLevel: string;                         // Very emotionally close, Fairly emotionally close, Neutral, Not very emotionally close, Not at all emotionally close
  supportProviderSpecificInvolvementPreference: string;                   // Direct caregiver, assisting with daily activities, Financial manager, handling costs and budgets, Care coordinator, arranging services, Emotional support provider, offering comfort and companionship, Medical decision-maker, assuming healthcare proxy duties
  supportProviderFactorPrioritization: string[]                           // Time availability, Financial resources, Emotional connection, Geographic proximity, Personal skills and abilities
  supportProviderValidCircumstancePreferences: string;                    // Assisting with daily activities, Providing financial support, Coordinating care and appointments, Offering emotional support and companionship, Making medical decisions
  supportProviderCareWillingnessCapabilitiyComfortLevel: string;          // Fully willing and capable, Willing, but with some reservations, Capable, but with some reservations, Neither willing nor capable
  supportProviderFinancialStabilityLevel: string;                         // Very stable, Somewhat stable, Somewhat unstable, Very unstable
  supportProviderExperienceLevel: string;                                 // Extensive experience/knowledge, Some experience/knowledge, Little to no experience/knowledge
  supportProviderSupportNetwork: string[]                                 // Other family members, Friends or neighbors, Community resources, No one at the moment
  supportProviderRelationshipToCareRecipient: string;                     // Very close, Fairly close, Neutral, Somewhat distant, Very distant
  supportProviderHoursPerWeek: string;                                    // Less than 10 hours, 10-20 hours, 20-30 hours, More than 30 hours
  supportProviderRelationshipForecast: string;                            // Very comfortable, Somewhat comfortable, Neutral, Somewhat uncomfortable, Very uncomfortable
  supportProviderEmotionalStrainForecast: string;                         // Very likely, Somewhat likely, Neutral, Somewhat unlikely, Very unlikely
  supportProviderFinancialWorryLevel: string;                             // Very concerned, Somewhat concerned, Neutral, Somewhat unconcerned, Not at all concerned
  supportProviderCareInterferenceLevel: string;                           // Very likely, Somewhat likely, Neutral, Somewhat unlikely, Very unlikely
  supportProviderPhysicalStressLevel: string;                             // Very high, Somewhat high, Neutral, Somewhat low, Very low
  supportProviderEmotionalStressLevel: string;                            // Very high, Somewhat high, Neutral, Somewhat low, Very low
  supportProviderDependentFamilyLevel: string;                            // Yes, significantly, Yes, somewhat, Yes, but unlikely to impact, No
  supportProviderChronicHealthIssueLevel: string;                         // Yes, significantly, Yes, somewhat, Yes, but unlikely to impact, No
  supportProviderMedicalFamiliarityLevel: string;                         // Fully understand, Understand to some extent, Only know basic details, Not very knowledgeable
  supportProviderTrainingComfortLevel: string;                            // Very willing, Somewhat willing, Neutral, Somewhat unwilling, Very unwilling
  supportProviderSupportServiceComfortLevel: string;                      // Home health care services, Adult day care services, Respite care services, Online or in-person support groups, Professional caregiving advice or consultation, I don't foresee needing any support services
  supportProviderEndOfLiveComfortLevel: string;                           // Very comfortable, Somewhat comfortable, Neutral, Somewhat uncomfortable, Very uncomfortable
  supportProviderDecisionMakingVoiceLevel: string;                        // Very much so, Somewhat, Not sure, Not really, Not at all
  supportProviderSetbackComfortLevel: string;                             // Very well, Fairly well, Neutral, Somewhat poorly, Very poorly
  supportProviderDurationComfortLevel: string;                            // Very prepared, Somewhat prepared, Neutral, Somewhat unprepared, Very unprepared
  supportProviderFinancialResponsibilityComfortLevel: string;             // Fully capable, Somewhat capable, Will struggle, but can manage, Not capable
  supportProviderAppreciationComfortLevel: string;                        // Fully prepared, Somewhat prepared, I have not considered this, Not prepared
  supportProviderOverwhelmPreferences: string;                            // I have effective coping strategies, I manage, but struggle sometimes, I often struggle with managing these feelings, I don't have any coping strategies
  supportProviderImpactToOtherRelationshipsComfortLevel: string;          // Yes, and it won't significantly impact these relationships, Yes, and there may be some impact, I haven't considered this, This is a significant concern for me
  supportProviderPersonalCareTasksComfortLevel: string;                   // Comfortable, Somewhat comfortable, Uncomfortable but willing to learn, Very uncomfortable
  supportProviderHealthcareNavigationComfortLevel: string;                // Very ready, Somewhat ready, I could use more information, Not ready
}
