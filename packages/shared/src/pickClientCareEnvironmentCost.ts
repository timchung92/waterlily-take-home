import { CareEnvironment, isNullOrUndefined } from '.';
import { localCareEnvironmentRates } from './localCareEnvironmentRates';

type ClientCareEnvironmentCost = {
  rateAmount: number;
  ratePeriod: string;
  hasCustomRate: boolean;
};

export function pickClientCareEnvironmentCosts(
  client: Client,
  careEnvironment: CareEnvironment,
): ClientCareEnvironmentCost {
  const {
    intakeSurvey: { clientZipCode, clientLtcZipCode },
    careEnvironmentCosts,
  } = client;

  const useZipCode = isNullOrUndefined(clientLtcZipCode)
    ? clientZipCode
    : clientLtcZipCode;

  const zipCodeRateData = localCareEnvironmentRates(
    useZipCode,
    careEnvironment,
  );
  const selectedCareSettingCost = careEnvironmentCosts
    ? careEnvironmentCosts[careEnvironment]
    : undefined;

  const hasCustomRate =
    !isNullOrUndefined(careEnvironmentCosts) &&
    !isNullOrUndefined(selectedCareSettingCost);

  return {
    rateAmount: hasCustomRate
      ? selectedCareSettingCost
      : zipCodeRateData.rateAmount,
    ratePeriod: zipCodeRateData.ratePeriod,
    hasCustomRate: hasCustomRate,
  };
}
