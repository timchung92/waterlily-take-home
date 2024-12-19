import { FunctionComponent } from 'react';
import {
  OnboardingCarePhasesPhaseOne,
  OnboardingCarePhasesPhaseThree,
  OnboardingCarePhasesPhaseTwo,
  OnboardingCareSettingsPhaseOne,
  OnboardingCareSettingsPhaseThree,
  OnboardingCareSettingsPhaseTwo,
  OnboardingFamilyCaregivingPhaseOne,
  OnboardingFamilyCaregivingPhaseThree,
  OnboardingFamilyCaregivingPhaseTwo,
} from '../pages';
import { CarePhase, carePhaseDefs } from '@shared';

export function getFirstCarePhasePage(client: Client) {
  const { clientHasStartedLtc, clientCurrentCarePhase } = client.intakeSurvey;
  if (!clientHasStartedLtc) return OnboardingCarePhasesPhaseOne;

  // if client has started LTC, skip past care phases
  switch (clientCurrentCarePhase) {
    case CarePhase.earlyCare:
      return OnboardingCarePhasesPhaseOne;
    case CarePhase.moderateCare:
      return OnboardingCarePhasesPhaseTwo;
    case CarePhase.fullCare:
      return OnboardingCarePhasesPhaseThree;
    default:
      return OnboardingCarePhasesPhaseOne;
  }
}

export function getCareSettingsPageBy(
  carePhase: CarePhase,
): FunctionComponent<ClientIdProps> | undefined {
  switch (carePhaseDefs[carePhase].index) {
    case 0:
      return OnboardingCareSettingsPhaseOne;
    case 1:
      return OnboardingCareSettingsPhaseTwo;
    case 2:
      return OnboardingCareSettingsPhaseThree;
    default:
      return undefined;
  }
}

export function getFamilyInvolvementPageBy(
  carePhase: CarePhase,
): FunctionComponent<ClientIdProps> | undefined {
  switch (carePhaseDefs[carePhase].index) {
    case 0:
      return OnboardingFamilyCaregivingPhaseOne;
    case 1:
      return OnboardingFamilyCaregivingPhaseTwo;
    case 2:
      return OnboardingFamilyCaregivingPhaseThree;
    default:
      return undefined;
  }
}

export function getCarePhasePageBy(
  carePhase: CarePhase,
): FunctionComponent<ClientIdProps> | undefined {
  switch (carePhaseDefs[carePhase].index) {
    case 0:
      return OnboardingCarePhasesPhaseOne;
    case 1:
      return OnboardingCarePhasesPhaseTwo;
    case 2:
      return OnboardingCarePhasesPhaseThree;
    default:
      return undefined;
  }
}
