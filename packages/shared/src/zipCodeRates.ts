import { CareEnvironment } from './appModel';
import zipCodeCostData from '../data/zipcodeCareEnvironmentCost.json';
import { isNullOrUndefined } from '.';
import { convertCareEnvironmentToString } from './localCareEnvironmentRates';

type ZipCodeData = {
  [zipcode: string]: CareEnvironmentData;
};

export function isValidZipCode(zipCode: string): boolean {
  // check if zipcode is valid format
  const zipCodeTrimmed = zipCode.trim();
  const zipCodePattern = /^\d{5}$/;
  const zipCodePatternWithLeadingZero = /^0\d{4}$/;
  const isValidZipCodePattern =
    zipCodePattern.test(zipCodeTrimmed) ||
    zipCodePatternWithLeadingZero.test(zipCodeTrimmed);

  if (!isValidZipCodePattern) {
    return false;
  }
  // check if zipcode without leading zero exists within the data
  if (zipCodePatternWithLeadingZero.test(zipCodeTrimmed)) {
    const leadingZeroZipCodeEntry = (zipCodeCostData as ZipCodeData)[
      zipCodeTrimmed.slice(1)
    ];
    return !isNullOrUndefined(leadingZeroZipCodeEntry);
  }

  // check if zipcode exists within the data
  return !isNullOrUndefined((zipCodeCostData as ZipCodeData)[zipCodeTrimmed]);
}

export function zipCodeRateFor(
  zipCode: string,
  careEnvironment: CareEnvironment,
): CostAndRatePeriod | undefined {
  const careEnvironmentString = convertCareEnvironmentToString(careEnvironment);
  let costAndRateData = (zipCodeCostData as ZipCodeData)[zipCode.trim()]?.[
    careEnvironmentString
  ];

  // if the zip code is not found, try removing the leading 0
  if (isNullOrUndefined(costAndRateData) && zipCode.charAt(0) === '0') {
    costAndRateData = (zipCodeCostData as ZipCodeData)[zipCode.slice(1)]?.[
      careEnvironmentString
    ];
  }
  return costAndRateData;
}
