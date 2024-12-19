declare interface Client {
  clientId: string;
  advisorId: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientStatus: ClientStatus;
  lastSlideSeen: number;
  planProgressPercent: number;
  clientAddedDateTime: Date;
  clientTags: string[];
  surveys: Survey[];
  intakeSurvey: IntakeSurvey;
  inferenceSet: InferenceSet;
  supportProviderSet: SupportProviderSet;
  careEnvironmentSelections: CareEnvironmentSelections;
  careEnvironmentCosts: CareEnvironmentCosts;
  carePhaseDurationSelections: CarePhaseDurationSelections;
  fundingSources: FundingSources;
  multipleFundingSources: MultipleFundingSources;
  unsuccessfulMagicLinkAttempts: number;
  onboardingSlideProgress: ClientOnboardingSlideProgress | null;
  partnerClientId: string | null;
  surveyId: string | null; // only present going forward if client is created by advisor in app
  intakeFormUrl: string | null; // only present going forward if client is created by advisor in app
  clientCustomInferences: ClientCustomInferences;
  appliedInferenceSet: InferenceSet;
  introIntakeSurvey: IntroIntakeSurvey;
  clientCalculationSettings: ClientCalculationSettings;

  // client-side fields
  clientFullName: string;
  cachedTimestamp?: Date;
  phaseCosts: SinglePhaseCosts[];
  phaseCalculations: SinglePhaseCalculations[];
  policyPhaseCalculations: PolicyPhaseCalculations;
  allPhaseCosts: AllPhaseCosts;
  recommendedCareEnvironments: Record<CarePhase, CareEnvironment>;
  appliedCareEnvironments: Record<CarePhase, CareEnvironment>;
  clientPhasePredictedStartYears: Record<CarePhase, number | null>;
  clientPhasePredictedEndYears: Record<CarePhase, number | null>;
  clientYearsTillPhaseEnd: Record<CarePhase, number | null>;
  clientPhaseInflationFactors: Record<CarePhase, number | null>;
  dangerZoneCalculations: DangerZoneCalculations;
  potentialSavingsClient: Client | null;
  mutableClientPartner: Client | null; // only used right now for joint policy modeling
}
