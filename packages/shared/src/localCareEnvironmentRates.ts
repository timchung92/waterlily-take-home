import { isValidZipCode, zipCodeRateFor, CareEnvironment } from '.';
import { SupportProviderRatePeriod } from './SupportProviderRatePeriod';
import {
  getState,
  getStateNonMetroRate,
  isValidState,
} from './stateNonMetroRates';

function nationalAverageFor(
  careEnvironment: CareEnvironment,
): CostAndRatePeriod {
  const nationalAverages = {
    assistedLiving: 5136.69,
    homeCare: 27.15,
    fullCareFacility: 9979.31,
    independentLiving: 3132.82,
  };
  const monthlyRatePeriod =
    SupportProviderRatePeriod.monthly.toLocaleLowerCase() as
      | 'monthly'
      | 'hourly';
  const hourlyRatePeriod =
    SupportProviderRatePeriod.hourly.toLocaleLowerCase() as
      | 'monthly'
      | 'hourly';
  switch (careEnvironment) {
    case CareEnvironment.assistedLiving:
      return {
        rateAmount: nationalAverages.assistedLiving,
        ratePeriod: monthlyRatePeriod,
      };
    case CareEnvironment.fullCareFacility:
      return {
        rateAmount: nationalAverages.fullCareFacility,
        ratePeriod: monthlyRatePeriod,
      };
    case CareEnvironment.home:
      return {
        rateAmount: nationalAverages.homeCare,
        ratePeriod: hourlyRatePeriod,
      };
    case CareEnvironment.independentLiving:
      return {
        rateAmount: nationalAverages.independentLiving,
        ratePeriod: monthlyRatePeriod,
      };
  }
}

export function convertCareEnvironmentToString(
  careEnvironment: CareEnvironment,
): string {
  switch (careEnvironment) {
    case CareEnvironment.assistedLiving:
      return 'assistedLiving';
    case CareEnvironment.fullCareFacility:
      return 'fullCareFacility';
    case CareEnvironment.home:
      return 'homeCare';
    case CareEnvironment.independentLiving:
      return 'independentLiving';
  }
}

export function localCareEnvironmentRates(
  zipCode: string,
  careEnvironment: CareEnvironment,
): CostAndRatePeriod {
  const zipCodeRates = zipCodeRateFor(zipCode, careEnvironment);
  if (zipCodeRates) {
    return roundRateToNearestDollar(zipCodeRates);
  }

  const state = getState(zipCode);
  const stateRates = getStateNonMetroRate(state);

  if (!stateRates) {
    return roundRateToNearestDollar(nationalAverageFor(careEnvironment));
  }

  const careEnvironmentString = convertCareEnvironmentToString(careEnvironment);
  return roundRateToNearestDollar(stateRates[careEnvironmentString]);
}

type RateLocaleType = 'National' | 'State' | 'Local';

export function getRateLocaleType(zipCode: string): RateLocaleType {
  if (isValidZipCode(zipCode)) {
    return 'Local';
  }
  const state = getState(zipCode);
  if (isValidState(state)) {
    return 'State';
  }
  return 'National';
}

export function getRateLocaleDescription(zipCode: string): string {
  const rateLocaleType = getRateLocaleType(zipCode);
  return rateLocaleType === 'Local'
    ? `Zip code ${zipCode}`
    : rateLocaleType === 'State'
      ? `${getState(zipCode)} Non-Metro`
      : 'National median rate';
}

function roundRateToNearestDollar(
  costAndRateData: CostAndRatePeriod,
): CostAndRatePeriod {
  return {
    rateAmount: Math.round(costAndRateData.rateAmount),
    ratePeriod: costAndRateData.ratePeriod,
  };
}
