import { isNullUndefinedOrEmpty } from './isNullUndefinedOrEmpty';
import { CarePhase } from './appModel';

export function supportProviderAppliedPhaseHours(
  supportProvider: SupportProvider,
  carePhase: CarePhase,
) {
  return isNullUndefinedOrEmpty(supportProvider)
    ? 0
    : carePhase === CarePhase.earlyCare
      ? supportProvider.supportProviderAppliedPhaseOneHours
      : carePhase === CarePhase.moderateCare
        ? supportProvider.supportProviderAppliedPhaseTwoHours
        : supportProvider.supportProviderAppliedPhaseThreeHours;
}
