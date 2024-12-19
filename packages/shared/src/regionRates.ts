import { CareEnvironment } from './appModel';
import { SupportProviderRatePeriod } from './SupportProviderRatePeriod';

interface RegionCost {
  region: string;
  careEnvironment: CareEnvironment;
  regionRateAmount: number;
  regionRatePeriod: SupportProviderRatePeriod;
}

export const regionRates: RegionCost[] = [
  {
    region: 'Northeast',
    careEnvironment: CareEnvironment.assistedLiving,
    regionRateAmount: 5865.0,
    regionRatePeriod: SupportProviderRatePeriod.monthly,
  },
  {
    region: 'Midwest',
    careEnvironment: CareEnvironment.assistedLiving,
    regionRateAmount: 4325.0,
    regionRatePeriod: SupportProviderRatePeriod.monthly,
  },
  {
    region: 'South',
    careEnvironment: CareEnvironment.assistedLiving,
    regionRateAmount: 3998.0,
    regionRatePeriod: SupportProviderRatePeriod.monthly,
  },
  {
    region: 'West',
    careEnvironment: CareEnvironment.assistedLiving,
    regionRateAmount: 4498.0,
    regionRatePeriod: SupportProviderRatePeriod.monthly,
  },
  {
    region: 'Northeast',
    careEnvironment: CareEnvironment.fullCareFacility,
    regionRateAmount: 12015.0,
    regionRatePeriod: SupportProviderRatePeriod.monthly,
  },
  {
    region: 'Midwest',
    careEnvironment: CareEnvironment.fullCareFacility,
    regionRateAmount: 8251.0,
    regionRatePeriod: SupportProviderRatePeriod.monthly,
  },
  {
    region: 'South',
    careEnvironment: CareEnvironment.fullCareFacility,
    regionRateAmount: 7969.0,
    regionRatePeriod: SupportProviderRatePeriod.monthly,
  },
  {
    region: 'West',
    careEnvironment: CareEnvironment.fullCareFacility,
    regionRateAmount: 9726.0,
    regionRatePeriod: SupportProviderRatePeriod.monthly,
  },
  {
    region: 'Northeast',
    careEnvironment: CareEnvironment.home,
    regionRateAmount: 30.0,
    regionRatePeriod: SupportProviderRatePeriod.hourly,
  },
  {
    region: 'Midwest',
    careEnvironment: CareEnvironment.home,
    regionRateAmount: 28.5,
    regionRatePeriod: SupportProviderRatePeriod.hourly,
  },
  {
    region: 'South',
    careEnvironment: CareEnvironment.home,
    regionRateAmount: 24.0,
    regionRatePeriod: SupportProviderRatePeriod.hourly,
  },
  {
    region: 'West',
    careEnvironment: CareEnvironment.home,
    regionRateAmount: 29.75,
    regionRatePeriod: SupportProviderRatePeriod.hourly,
  },
  {
    region: 'Northeast',
    careEnvironment: CareEnvironment.independentLiving,
    regionRateAmount: 5720.0,
    regionRatePeriod: SupportProviderRatePeriod.monthly,
  },
  {
    region: 'Midwest',
    careEnvironment: CareEnvironment.independentLiving,
    regionRateAmount: 5444.0,
    regionRatePeriod: SupportProviderRatePeriod.monthly,
  },
  {
    region: 'South',
    careEnvironment: CareEnvironment.independentLiving,
    regionRateAmount: 4576.0,
    regionRatePeriod: SupportProviderRatePeriod.monthly,
  },
  {
    region: 'West',
    careEnvironment: CareEnvironment.independentLiving,
    regionRateAmount: 5625.0,
    regionRatePeriod: SupportProviderRatePeriod.monthly,
  },
];

function handleUndefinedRate(region: string, careEnvironment: CareEnvironment) {
  // some professional costs don't apply to some combos, so when we get one add as zero
  // also account for 'Other' census region
  const allRegionRates = regionRates.filter(
    rr => rr.careEnvironment === careEnvironment,
  );

  // Get the average rate amount for the specified careEnvironment
  if (allRegionRates.length > 0) {
    const averageRateAmount =
      allRegionRates.reduce((acc, curr) => acc + curr.regionRateAmount, 0) /
      allRegionRates.length;

    // all periods should be the same, so just grab the first one
    const regionRatePeriod = allRegionRates[0].regionRatePeriod;

    // Create a new rate object using the average rate
    return {
      region,
      careEnvironment,
      regionRateAmount: averageRateAmount,
      regionRatePeriod: regionRatePeriod,
    };
  }
  return {
    // something went wrong, so just return a zero rate
    region,
    careEnvironment,
    regionRateAmount: 0,
    regionRatePeriod: SupportProviderRatePeriod.hourly,
  };
}

export function regionRateFor(
  region: string,
  careEnvironment: CareEnvironment,
) {
  let rate = regionRates.find(
    rr => rr.region === region && rr.careEnvironment === careEnvironment,
  );
  if (rate === undefined) {
    rate = handleUndefinedRate(region, careEnvironment);
    regionRates.push(rate);
  }
  return rate;
}
