import { Draft } from 'immer';
import { CareEnvironment, CarePhase } from './appModel';
import { isProfessional } from './isProfessional';

export function calcSupportProviderDerivatives(mutableClient: Draft<Client>) {
  const { appliedCareEnvironments } = mutableClient;

  mutableClient.supportProviderSet.supportProviders.forEach(supportProvider => {
    const [applyPhaseOne, applyPhaseTwo, applyPhaseThree] =
      applyHoursToSupportProvider(supportProvider);

    supportProvider.supportProviderAllPhaseCareHours =
      (supportProvider.supportProviderAppliedPhaseOneHours = applyPhaseOne
        ? supportProvider.supportProviderPhaseOneHours
        : 0) +
      (supportProvider.supportProviderAppliedPhaseTwoHours = applyPhaseTwo
        ? supportProvider.supportProviderPhaseTwoHours
        : 0) +
      (supportProvider.supportProviderAppliedPhaseThreeHours = applyPhaseThree
        ? supportProvider.supportProviderPhaseThreeHours
        : 0);
  });

  function applyHoursToSupportProvider(
    supportProvider: SupportProvider,
  ): [boolean, boolean, boolean] {
    if (isProfessional(supportProvider)) {
      return [true, true, true];
    }

    // This flag is not used anymore, but leaving it here for now.
    // if (removeFamilyBurden) {
    //   return [ false, false, false ];
    // }

    return [
      appliedCareEnvironments[CarePhase.earlyCare] === CareEnvironment.home,
      appliedCareEnvironments[CarePhase.moderateCare] === CareEnvironment.home,
      appliedCareEnvironments[CarePhase.fullCare] === CareEnvironment.home,
    ];
  }
}
