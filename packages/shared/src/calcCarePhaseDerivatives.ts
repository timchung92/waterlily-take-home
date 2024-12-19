import {
  annualHealthcareInflationRate,
  carePhaseDefList,
  carePhaseDefs,
  CarePhase,
} from '.';

function phaseStartYearPlusDuration(
  phasePredictedStartYear: number,
  phaseCosts: SinglePhaseCosts,
) {
  return phasePredictedStartYear + phaseCosts.phaseCareMonthsNeeded / 12;
}

function calcPredictedPhaseStartYear(
  mutableClient: Client,
  carePhase: CarePhase,
): number | null {
  const {
    intakeSurvey: { clientHasStartedLtc, clientCurrentCarePhase },
    appliedInferenceSet: { ltcAtYear },
    phaseCosts,
    clientAddedDateTime,
    clientPhasePredictedStartYears,
  } = mutableClient;

  const carePhaseIndex = carePhaseDefs[carePhase].index;

  // Has Started LTC
  if (clientHasStartedLtc) {
    const clientCurrentCarePhaseIndex =
      carePhaseDefs[clientCurrentCarePhase!].index;
    // past or current phase. start has already occurred so no prediction
    if (carePhaseIndex <= clientCurrentCarePhaseIndex) {
      return null;
    }
    // first future phase starts at the end of the current phase (year client added + remaining duration of previous phase)
    if (carePhaseIndex === clientCurrentCarePhaseIndex + 1) {
      return (
        clientAddedDateTime.getFullYear() +
        phaseCosts[carePhaseIndex - 1].phaseCareMonthsNeeded / 12
      );
    }
    // subsequent future phases. the start of the care phase is the end of the previous care phase
    const previousCarePhase = carePhaseDefList[carePhaseIndex - 1].value;
    return phaseStartYearPlusDuration(
      clientPhasePredictedStartYears[previousCarePhase]!,
      phaseCosts[carePhaseIndex - 1],
    );
  }

  // has not started ltc
  if (carePhaseIndex === 0) {
    return ltcAtYear;
  }

  const previousCarePhase = carePhaseDefList[carePhaseIndex - 1].value;
  return phaseStartYearPlusDuration(
    clientPhasePredictedStartYears[previousCarePhase]!,
    phaseCosts[carePhaseIndex - 1],
  );
}

function calcPredictedPhaseEndYear(
  client: Client,
  carePhase: CarePhase,
): number | null {
  const {
    phaseCosts,
    clientPhasePredictedStartYears,
    intakeSurvey: { clientPhaseStartAges, clientBirthYear },
  } = client;
  const fullCarePhaseCosts =
    phaseCosts[carePhaseDefs[CarePhase.fullCare].index];

  if (carePhase === CarePhase.fullCare) {
    return phaseStartYearPlusDuration(
      clientPhasePredictedStartYears[CarePhase.fullCare] ??
        clientPhaseStartAges[CarePhase.fullCare]! + clientBirthYear,
      fullCarePhaseCosts,
    );
  }
  const nextPhase = phaseCosts[carePhaseDefs[carePhase].index + 1].carePhase;
  return clientPhasePredictedStartYears[nextPhase];
}

export function calcCarePhaseDerivatives(mutableClient: Client) {
  mutableClient.clientPhasePredictedStartYears = {} as Record<
    CarePhase,
    number | null
  >;
  mutableClient.clientPhasePredictedEndYears = {} as Record<
    CarePhase,
    number | null
  >;
  mutableClient.clientPhaseInflationFactors = {} as Record<
    CarePhase,
    number | null
  >;
  mutableClient.clientYearsTillPhaseEnd = {} as Record<
    CarePhase,
    number | null
  >;

  const {
    clientPhasePredictedStartYears,
    clientPhasePredictedEndYears,
    clientPhaseInflationFactors,
    clientYearsTillPhaseEnd,
  } = mutableClient;

  // calculate predicted phase start years
  carePhaseDefList.forEach(carePhaseDef => {
    clientPhasePredictedStartYears[carePhaseDef.value] =
      calcPredictedPhaseStartYear(mutableClient, carePhaseDef.value);
  });

  // calculate predicted phase end years, inflation factors, and years till phase end
  carePhaseDefList.forEach(carePhaseDef => {
    clientPhasePredictedEndYears[carePhaseDef.value] =
      calcPredictedPhaseEndYear(mutableClient, carePhaseDef.value);

    if (clientPhasePredictedEndYears[carePhaseDef.value] !== null) {
      clientYearsTillPhaseEnd[carePhaseDef.value] =
        clientPhasePredictedEndYears[carePhaseDef.value]! -
        new Date().getFullYear();

      clientPhaseInflationFactors[carePhaseDef.value] = Math.pow(
        1 + annualHealthcareInflationRate,
        clientYearsTillPhaseEnd[carePhaseDef.value]!,
      );
    }
  });
}
