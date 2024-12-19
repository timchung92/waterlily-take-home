declare interface SummableSinglePhaseCosts {
  phaseCareHoursNeeded: number;
  phaseCareMonthsNeeded: number;
  phaseCareHoursProvided: number;
  phaseCareHoursGap: number;
  phaseCarePeriodNeeded: number;
  phaseTotalCost: number;
  phaseFamilyCareHoursProvided: number;
  phaseFamilyCareCost: number;
  phaseProfessionalCareHoursProvided: number;
  phaseProfessionalShareCost: number;
  phaseInflatedProfessionalShareCost: number;
  phaseInflatedFamilyCareCost: number;
}
declare interface RecalculateSinglePhaseCosts {
  phaseFamilyProvidedPercent: number;
  phaseCareProvidedPercent: number;
}

declare interface SinglePhaseCosts
  extends SummableSinglePhaseCosts,
    RecalculateSinglePhaseCosts {
  phaseCareHoursRatio: number;
  phaseDurationRatio: number;
  familyCareHoursRatio: number;
  carePhase: CarePhase;
  appliedCareEnvironment: CareEnvironment;
  recommendedCareEnvironment: CareEnvironment;
  inHomeEnvironment: boolean;
  isDurationCustom: boolean;
}

declare interface AllPhaseSummableCosts {
  allPhaseCareHoursNeeded: number;
  allPhaseCareMonthsNeeded: number;
  allPhaseCareHoursProvided: number;
  allPhaseCareHoursGap: number;
  allPhaseCarePeriodNeeded: number;
  allPhaseTotalCost: number;
  allPhaseFamilyCareHoursProvided: number;
  allPhaseFamilyCareCost: number;
  allPhaseProfessionalCareHoursProvided: number;
  allPhaseProfessionalShareCost: number;
  allPhaseInflatedProfessionalShareCost: number;
  allPhaseInflatedFamilyCareCost: number;
}

declare interface AllPhaseCosts extends AllPhaseSummableCosts {
  allPhaseFamilyProvidedPercent: number;
  allPhaseCareProvidedPercent: number;
  allPhaseHomeCareHoursNeeded: number;
  allPhaseHomeCareHoursProvided: number;
  allPhaseHomeProfessionalCareHoursProvided: number;
}
