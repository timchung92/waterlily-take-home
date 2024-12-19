import { CarePhase } from '.';

export function calcLtcEndYear(client: Client): number {
  const {
    inferenceSet: { ltcAtYear },
    allPhaseCosts: { allPhaseCareMonthsNeeded },
    clientPhasePredictedEndYears,
  } = client;

  if (
    clientPhasePredictedEndYears &&
    clientPhasePredictedEndYears[CarePhase.fullCare]
  ) {
    return clientPhasePredictedEndYears[CarePhase.fullCare];
  }

  return ltcAtYear + allPhaseCareMonthsNeeded / 12;
}
