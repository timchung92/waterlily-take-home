import { Draft } from 'immer';
import { isNullOrUndefined } from '.';

export function calcInferenceSetDerivatives(mutableClient: Draft<Client>) {
  const {
    inferenceSet,
    intakeSurvey: {
      clientAge,
      clientBirthYear,
      clientHasStartedLtc,
      clientPhaseStartAges,
    },
    clientCustomInferences,
  } = mutableClient;

  /**
   * If the following conditions are met send the alternate flow:
   * - their current age is greater than their predicted age
   * - predicted age is 65 or younger
   * - their current age is less than their predicted age by only 5 years or less
   */
  const yearsTillLtc = inferenceSet.ltcAtAge - clientAge;

  let ltcAtAgeLowerBound =
    (clientAge > inferenceSet.ltcAtAge || yearsTillLtc <= 5) &&
    !clientHasStartedLtc
      ? Math.ceil(clientAge / 5) * 5
      : inferenceSet.ltcAtAge <= 65
        ? Math.round(inferenceSet.ltcAtAge / 5) * 5
        : 0;

  ltcAtAgeLowerBound = clientHasStartedLtc ? 0 : ltcAtAgeLowerBound; // n/a if already on claim
  if (ltcAtAgeLowerBound > 0) {
    inferenceSet.ltcAtAgeShowRange = true;
    inferenceSet.ltcAtAgeLowerBound = ltcAtAgeLowerBound;
    inferenceSet.ltcAtAgeUpperBound = ltcAtAgeLowerBound + 10;
    inferenceSet.ltcAtAgeMiddleBound = ltcAtAgeLowerBound + 5;
    inferenceSet.ltcAtAge = ltcAtAgeLowerBound + 5;
  } else {
    inferenceSet.ltcAtAgeShowRange = false;
    inferenceSet.ltcAtAgeLowerBound = inferenceSet.ltcAtAge;
    inferenceSet.ltcAtAgeUpperBound = inferenceSet.ltcAtAge;
  }

  // override predictions if client defined (custom) one exists
  let appliedInferenceSet = {
    ...inferenceSet,
    ltcAtAge: clientCustomInferences.ltcAtAge ?? inferenceSet.ltcAtAge,
  } as InferenceSet;

  // If the client has started LTC, set the likelihood to 1
  const ltcLikelihoodEver = clientHasStartedLtc
    ? 1
    : inferenceSet.ltcLikelihoodEver;
  appliedInferenceSet.ltcLikelihoodEver = ltcLikelihoodEver;

  // if on claim, calculate the ltcAtAge based on their youngest phase start age
  if (clientHasStartedLtc) {
    const carePhaseAges = Object.values(clientPhaseStartAges).filter(
      age => !isNullOrUndefined(age),
    ) as number[];
    const carePhaseStartAge = Math.min(...carePhaseAges) ?? clientAge;
    inferenceSet.ltcAtAge = carePhaseStartAge;
    appliedInferenceSet.ltcAtAge = carePhaseStartAge;
  }

  appliedInferenceSet.yearsTillLtc = appliedInferenceSet.ltcAtAge - clientAge;
  appliedInferenceSet.ltcAtYear =
    clientBirthYear + appliedInferenceSet.ltcAtAge;

  mutableClient.appliedInferenceSet = appliedInferenceSet;
}
