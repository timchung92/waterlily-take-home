import { FunctionComponent } from 'react';
import {
  OnboardingCostFactors,
  OnboardingCareSettingsPhaseOne,
  OnboardingCareSettingsPhaseTwo,
  OnboardingCareSettingsPhaseThree,
  OnboardingFamilyCaregivingPhaseOne,
  OnboardingFamilyCaregivingPhaseTwo,
  OnboardingFamilyCaregivingPhaseThree,
  OnboardingCarePhasesPhaseOne,
  OnboardingCarePhasesPhaseTwo,
  OnboardingCarePhasesPhaseThree,
  OnboardingCarePhasesSummary,
  OnboardingOurPredictions,
  OnboardingPredictedCareNeeds,
  OnboardingResultsAreIn,
} from '../pages';
import _ from 'lodash';


export const onboardingSlideByIndex: FunctionComponent<ClientIdProps>[] = [
  OnboardingResultsAreIn,
  OnboardingOurPredictions,
  OnboardingPredictedCareNeeds,
  OnboardingCostFactors,
  OnboardingCarePhasesPhaseOne,
  OnboardingCareSettingsPhaseOne,
  OnboardingFamilyCaregivingPhaseOne,
  OnboardingCarePhasesPhaseTwo,
  OnboardingCareSettingsPhaseTwo,
  OnboardingFamilyCaregivingPhaseTwo,
  OnboardingCarePhasesPhaseThree,
  OnboardingCareSettingsPhaseThree,
  OnboardingFamilyCaregivingPhaseThree,
  OnboardingCarePhasesSummary,
];

export const onboardingSlideFirst = onboardingSlideByIndex[0];
export const onboardingSlideLast =
  onboardingSlideByIndex[onboardingSlideByIndex.length - 1];

export function selectSlides(
  client: Client,
): FunctionComponent<ClientIdProps>[] {
  return onboardingSlideByIndex;
}


export function isSelectedSlidesFiltered(
  selectedSlides: FunctionComponent<ClientIdProps>[],
): boolean {
  return !_.isEqual(selectedSlides, onboardingSlideByIndex);
}
