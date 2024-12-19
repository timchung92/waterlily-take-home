import { carePhaseDefList, isNullOrUndefined } from '@shared';

export function calcClientPhaseStartYears(
  client: Client,
): Record<CarePhase, number | null> {
  // combined predicted start years and actual start years into one record
  const {
    clientPhasePredictedStartYears,
    intakeSurvey: { clientPhaseStartAges, clientBirthYear },
  } = client;

  const phaseStartYears: Record<CarePhase, number | null> = {} as Record<
    CarePhase,
    number | null
  >;

  for (const carePhaseDef of carePhaseDefList) {
    const carePhase = carePhaseDef.value;
    const predictedStartYear = clientPhasePredictedStartYears[carePhase];
    if (predictedStartYear) {
      phaseStartYears[carePhase] = predictedStartYear;
    } else if (!isNullOrUndefined(clientPhaseStartAges[carePhase])) {
      phaseStartYears[carePhase] =
        clientBirthYear + clientPhaseStartAges[carePhase]!;
    } else {
      phaseStartYears[carePhase] = null;
    }
  }

  return phaseStartYears;
}
