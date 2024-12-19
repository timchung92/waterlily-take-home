declare interface InferenceSet {
  inferenceSetVersionId: string;
  inferenceSetId: string;
  inferenceSetVersionDateTime: Date;
  clientId: string;
  inferenceSetRunDateTime: Date;
  ltcLikelihoodEver: number;
  ltcLikelihood10Years: number;
  ltcAtAge: number;
  ltcDurationYears: number;
  partnerHelperPercent: number;
  professionalHelperPercent: number;
  childHelperPercent: number;
  otherFamilyHelperPercent: number;
  monthlyHelpHours: number;
  ltcTotalCost: number;
  ltcFamilyCareCost: number;
  ltcProfessionalShareCost: number;
  totalCareHoursNeeded: number;
  childrenCareHoursProvided: number;
  otherFamilyCareHoursProvided: number;
  partnerCareHoursProvided: number;
  professionalCareHoursProvided: number;
  phaseOneCareHoursRatio: number;
  phaseTwoCareHoursRatio: number;
  phaseThreeCareHoursRatio: number;
  phaseOneDurationYearsRatio: number;
  phaseTwoDurationYearsRatio: number;
  phaseThreeDurationYearsRatio: number;
  childrenCareHoursPreferred: number;
  otherFamilyCareHoursPreferred: number;
  partnerCareHoursPreferred: number;
  professionalCareHoursPreferred: number;

  // Calculated fields
  ltcAtYear: number;
  yearsTillLtc: number;
  ltcAtAgeShowRange: boolean;
  ltcAtAgeLowerBound: number;
  ltcAtAgeUpperBound: number;
  ltcAtAgeMiddleBound: number;
}
