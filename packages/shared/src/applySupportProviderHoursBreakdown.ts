
export function applySupportProviderHoursBreakdown(
  newTotalHours: number,
  supportProvider: SupportProvider,
  client: Client,
): SupportProvider {
  const {
    phaseCosts: [
      { familyCareHoursRatio: phaseOneFamilyCareHoursRatio },
      { familyCareHoursRatio: phaseTwoFamilyCareHoursRatio },
      { familyCareHoursRatio: phaseThreeFamilyCareHoursRatio },
    ]
  } = client;

  return {
    ...supportProvider,
    supportProviderPhaseOneHours: Math.round(newTotalHours * phaseOneFamilyCareHoursRatio),
    supportProviderPhaseTwoHours: Math.round(newTotalHours * phaseTwoFamilyCareHoursRatio),
    supportProviderPhaseThreeHours: Math.round(newTotalHours * phaseThreeFamilyCareHoursRatio),
  };
}
