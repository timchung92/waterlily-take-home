import { toRecord } from './toRecord';
import { FundingPolicyType } from './appModel';

export interface FundingPolicyTypeDef {
  value: FundingPolicyType;
  key: keyof typeof FundingPolicyType;
  label: string;
  isJoint: boolean;
  description: string;
  calculationType: FundingPolicyType;
  genericType?: FundingPolicyType;
  isGeneric?: boolean;
  carrier?: string;
  isGroupPolicy?: boolean;
  extractionMethod?: 'file' | 'text';
}

const genericFundingPolicyTypeDefList: FundingPolicyTypeDef[] = [
  {
    value: FundingPolicyType.longTermCareInsurance,
    key: FundingPolicyType[
      FundingPolicyType.longTermCareInsurance
    ] as FundingPolicyTypeDef['key'],
    label: 'Traditional LTC Policy',
    isJoint: false,
    description: 'Maximum benefit amount with possible inflation protection',
    calculationType: FundingPolicyType.longTermCareInsurance,
    isGeneric: true,
  },
  {
    value: FundingPolicyType.jointLongTermCareInsurance,
    key: FundingPolicyType[
      FundingPolicyType.jointLongTermCareInsurance
    ] as FundingPolicyTypeDef['key'],
    label: 'Joint Traditional LTC Policy',
    isJoint: true,
    description: 'Traditional LTC Policy with shared care benefits',
    calculationType: FundingPolicyType.longTermCareInsurance,
    isGeneric: true,
  },
  {
    value: FundingPolicyType.lifeInsuranceWithRider,
    key: FundingPolicyType[
      FundingPolicyType.lifeInsuranceWithRider
    ] as FundingPolicyTypeDef['key'],
    label: 'Life with Benefits Rider',
    isJoint: false,
    description:
      'Single death benefit pool that can be used for long-term care',
    calculationType: FundingPolicyType.lifeInsuranceWithRider,
    isGeneric: true,
  },
  {
    value: FundingPolicyType.hybridLifeInsurance,
    key: FundingPolicyType[
      FundingPolicyType.hybridLifeInsurance
    ] as FundingPolicyTypeDef['key'],
    label: 'Hybrid Policy',
    isJoint: false,
    description: 'Death benefit and continuation of benefit amounts',
    calculationType: FundingPolicyType.hybridLifeInsurance,
    isGeneric: true,
  },
  {
    value: FundingPolicyType.shortTermCareInsurance,
    key: FundingPolicyType[
      FundingPolicyType.shortTermCareInsurance
    ] as FundingPolicyTypeDef['key'],
    label: 'Short Term Care Policy',
    isJoint: false,
    description: 'Maxmimum benefit with limited benefit period',
    calculationType: FundingPolicyType.shortTermCareInsurance,
    isGeneric: true,
  },
  {
    value: FundingPolicyType.annuityHybrid,
    key: FundingPolicyType[
      FundingPolicyType.annuityHybrid
    ] as FundingPolicyTypeDef['key'],
    label: 'Annuity Hybrid Policy',
    isJoint: false,
    description: 'Annuity value plus long-term care benefits',
    calculationType: FundingPolicyType.annuityHybrid,
    isGeneric: true,
  },
  {
    value: FundingPolicyType.jointHybridAssetBased,
    key: FundingPolicyType[
      FundingPolicyType.jointHybridAssetBased
    ] as FundingPolicyTypeDef['key'],
    label: 'Joint Hybrid Policy',
    isJoint: true,
    description: 'Hybrid Policy with spousal benefits',
    calculationType: FundingPolicyType.hybridLifeInsurance,
    isGeneric: true,
  },
  {
    value: FundingPolicyType.jointHybridAnnuityBased,
    key: FundingPolicyType[
      FundingPolicyType.jointHybridAnnuityBased
    ] as FundingPolicyTypeDef['key'],
    label: 'Joint Annuity Hybrid Policy',
    isJoint: true,
    description: 'Annuity Hybrid with spousal benefits',
    calculationType: FundingPolicyType.annuityHybrid,
    isGeneric: true,
  },
  {
    value: FundingPolicyType.hybridLifeIra,
    key: FundingPolicyType[
      FundingPolicyType.hybridLifeIra
    ] as FundingPolicyTypeDef['key'],
    label: 'Hybrid Life IRA',
    isJoint: false,
    description: 'Life insurance with LTC benefits funded by IRA',
    calculationType: FundingPolicyType.hybridLifeIra,
    isGeneric: true,
  },
  {
    value: FundingPolicyType.jointHybridLifeIra,
    key: FundingPolicyType[
      FundingPolicyType.jointHybridLifeIra
    ] as FundingPolicyTypeDef['key'],
    label: 'Joint Hybrid Life IRA',
    isJoint: true,
    description: 'Joint life with LTC benefits funded by IRA',
    calculationType: FundingPolicyType.hybridLifeIra,
    isGeneric: true,
  },
];

export const fundingPolicyTypeDefList: FundingPolicyTypeDef[] = [
  ...genericFundingPolicyTypeDefList,
  {
    value: FundingPolicyType.lifeWithIndexAccount,
    key: FundingPolicyType[
      FundingPolicyType.lifeWithIndexAccount
    ] as FundingPolicyTypeDef['key'],
    label: 'Financial Foundational IUL',
    isJoint: false,
    description: 'Life insurance index account options',
    calculationType: FundingPolicyType.lifeInsuranceWithRider,
    carrier: 'Transamerica',
  },
  {
    value: FundingPolicyType.allstateHybridPolicy,
    key: FundingPolicyType[
      FundingPolicyType.allstateHybridPolicy
    ] as FundingPolicyTypeDef['key'],
    label: 'Allstate Insurance',
    isJoint: false,
    description: 'Life insurance with LTC benefits',
    calculationType: FundingPolicyType.hybridLifeInsurance,
    carrier: 'Allstate',
    isGroupPolicy: true,
  },
  {
    value: FundingPolicyType.fortifiedLife,
    key: FundingPolicyType[
      FundingPolicyType.fortifiedLife
    ] as FundingPolicyTypeDef['key'],
    label: 'Fortified Life',
    isJoint: false,
    description: 'Membership program that provides home-based services',
    calculationType: FundingPolicyType.longTermCareInsurance,
    carrier: 'Western Home',
  },
  {
    value: FundingPolicyType.nylSecureCare,
    key: FundingPolicyType[
      FundingPolicyType.nylSecureCare
    ] as FundingPolicyTypeDef['key'],
    label: 'Secure Care',
    isJoint: false,
    description: 'Secure Care Long-Term Care Insurance',
    calculationType: FundingPolicyType.longTermCareInsurance,
    carrier: 'New York Life',
  },
  {
    value: FundingPolicyType.nylAssetFlex,
    key: FundingPolicyType[
      FundingPolicyType.nylAssetFlex
    ] as FundingPolicyTypeDef['key'],
    label: 'Asset Flex',
    isJoint: false,
    description: 'Fixed Premium UL with LTC Benefits',
    calculationType: FundingPolicyType.hybridLifeInsurance,
    carrier: 'New York Life',
  },
  {
    value: FundingPolicyType.nylJointSecureCare,
    key: FundingPolicyType[
      FundingPolicyType.nylJointSecureCare
    ] as FundingPolicyTypeDef['key'],
    label: 'Joint Secure Care',
    isJoint: true,
    description: 'Secure Care with Shared Care Rider',
    calculationType: FundingPolicyType.longTermCareInsurance,
    carrier: 'New York Life',
  },
  {
    value: FundingPolicyType.secureCareThree,
    key: FundingPolicyType[
      FundingPolicyType.secureCareThree
    ] as FundingPolicyTypeDef['key'],
    label: 'Secure Care III',
    isJoint: false,
    description: 'Linked benefit product with cash indemnity LTC benefits',
    calculationType: FundingPolicyType.hybridLifeInsurance,
    carrier: 'Securian Financial',
  },
  {
    value: FundingPolicyType.moneyGuardFixedAdvantage,
    key: FundingPolicyType[
      FundingPolicyType.moneyGuardFixedAdvantage
    ] as FundingPolicyTypeDef['key'],
    label: 'MoneyGuard Fixed Advantage',
    isJoint: false,
    description: 'Universal life insurance with a long-term care rider',
    calculationType: FundingPolicyType.hybridLifeInsurance,
    carrier: 'Lincoln',
  },
  {
    value: FundingPolicyType.assetCare,
    key: FundingPolicyType[
      FundingPolicyType.assetCare
    ] as FundingPolicyTypeDef['key'],
    label: 'AssetCare',
    isJoint: false,
    description: 'Asset-based LTC hybrid policy',
    calculationType: FundingPolicyType.hybridLifeInsurance,
    carrier: 'OneAmerica',
  },
  {
    value: FundingPolicyType.careMattersTwo,
    key: FundingPolicyType[
      FundingPolicyType.careMattersTwo
    ] as FundingPolicyTypeDef['key'],
    label: 'CareMatters II',
    isJoint: false,
    description: 'Cash indemnity LTC policy',
    calculationType: FundingPolicyType.hybridLifeInsurance,
    carrier: 'Nationwide',
  },
  {
    value: FundingPolicyType.jointAssetCare,
    key: FundingPolicyType[
      FundingPolicyType.jointAssetCare
    ] as FundingPolicyTypeDef['key'],
    label: 'Joint Asset Care',
    isJoint: true,
    description: 'Asset-based LTC hybrid policy with joint benefits',
    calculationType: FundingPolicyType.hybridLifeInsurance,
    genericType: FundingPolicyType.jointHybridAssetBased,
    carrier: 'OneAmerica',
  },
  {
    value: FundingPolicyType.jointCareMatters,
    key: FundingPolicyType[
      FundingPolicyType.jointCareMatters
    ] as FundingPolicyTypeDef['key'],
    label: 'Joint CareMatters',
    isJoint: true,
    description: 'Cash indemnity LTC policy with joint benefits',
    calculationType: FundingPolicyType.hybridLifeInsurance,
    genericType: FundingPolicyType.jointHybridAssetBased,
    carrier: 'Nationwide',
  },
  {
    value: FundingPolicyType.forecareFixedAnnuity,
    key: FundingPolicyType[
      FundingPolicyType.forecareFixedAnnuity
    ] as FundingPolicyTypeDef['key'],
    label: 'ForeCare',
    isJoint: false,
    description: 'Fixed annuity with LTC benefits',
    calculationType: FundingPolicyType.annuityHybrid,
    carrier: 'Global Atlantic',
    extractionMethod: 'file',
  },
  {
    value: FundingPolicyType.annuityCareTwo,
    key: FundingPolicyType[
      FundingPolicyType.annuityCareTwo
    ] as FundingPolicyTypeDef['key'],
    label: 'AnnuityCare II',
    isJoint: false,
    description: 'Deferred annuity with LTC benefits',
    calculationType: FundingPolicyType.annuityHybrid,
    carrier: 'OneAmerica',
  },
  {
    value: FundingPolicyType.jointForecareFixedAnnuity,
    key: FundingPolicyType[
      FundingPolicyType.jointForecareFixedAnnuity
    ] as FundingPolicyTypeDef['key'],
    label: 'Joint ForeCare',
    isJoint: true,
    description: 'Fixed annuity with LTC benefits with joint benefits',
    calculationType: FundingPolicyType.annuityHybrid,
    genericType: FundingPolicyType.jointHybridAnnuityBased,
    carrier: 'Global Atlantic',
    extractionMethod: 'file',
  },
  {
    value: FundingPolicyType.assetcareThree,
    key: FundingPolicyType[
      FundingPolicyType.assetcareThree
    ] as FundingPolicyTypeDef['key'],
    label: 'AssetCare III',
    isJoint: false,
    description: 'Deferred IRA and Whole Life with LTC benefits',
    calculationType: FundingPolicyType.hybridLifeIra,
    carrier: 'OneAmerica',
  },
  {
    value: FundingPolicyType.jointAssetcareThree,
    key: FundingPolicyType[
      FundingPolicyType.jointAssetcareThree
    ] as FundingPolicyTypeDef['key'],
    label: 'AssetCare III',
    isJoint: true,
    description: 'Deferred IRA and Whole Life with LTC benefits for two',
    calculationType: FundingPolicyType.hybridLifeIra,
    genericType: FundingPolicyType.jointHybridLifeIra,
    carrier: 'OneAmerica',
  },
  {
    value: FundingPolicyType.noLapseGuaranteeLife,
    key: FundingPolicyType[
      FundingPolicyType.noLapseGuaranteeLife
    ] as FundingPolicyTypeDef['key'],
    label: 'No-Lapse Guarantee UL II',
    isJoint: false,
    description: 'UL with LTC benefits',
    calculationType: FundingPolicyType.lifeInsuranceWithRider,
    carrier: 'Nationwide',
  },
  {
    value: FundingPolicyType.thriventLongTermCareInsurance,
    key: FundingPolicyType[
      FundingPolicyType.thriventLongTermCareInsurance
    ] as FundingPolicyTypeDef['key'],
    label: 'Long-term Care Insurance',
    isJoint: false,
    description: 'Long-term care insurance',
    calculationType: FundingPolicyType.longTermCareInsurance,
    carrier: 'Thrivent',
  },
  {
    value: FundingPolicyType.jointThriventLongTermCareInsurance,
    key: FundingPolicyType[
      FundingPolicyType.jointThriventLongTermCareInsurance
    ] as FundingPolicyTypeDef['key'],
    label: 'Long-term Care Insurance with Shared Care',
    isJoint: true,
    description: 'Long-term care insurance with shared benefits',
    calculationType: FundingPolicyType.longTermCareInsurance,
    genericType: FundingPolicyType.jointLongTermCareInsurance,
    carrier: 'Thrivent',
  },
  {
    value: FundingPolicyType.nglEssentialLtc,
    key: FundingPolicyType[
      FundingPolicyType.nglEssentialLtc
    ] as FundingPolicyTypeDef['key'],
    label: 'EssentialLTC',
    isJoint: false,
    description: 'Long-term care insurance',
    calculationType: FundingPolicyType.longTermCareInsurance,
    carrier: 'NGL',
  },
  {
    value: FundingPolicyType.jointNglEssentialLtc,
    key: FundingPolicyType[
      FundingPolicyType.jointNglEssentialLtc
    ] as FundingPolicyTypeDef['key'],
    label: 'EssentialLTC with Shared Benefits',
    isJoint: true,
    description: 'Long-term care insurance with shared benefits',
    calculationType: FundingPolicyType.longTermCareInsurance,
    genericType: FundingPolicyType.jointLongTermCareInsurance,
    carrier: 'NGL',
  },
  {
    value: FundingPolicyType.mutualOfOmahaMutualcare,
    key: FundingPolicyType[
      FundingPolicyType.mutualOfOmahaMutualcare
    ] as FundingPolicyTypeDef['key'],
    label: 'MutualCare',
    isJoint: false,
    description: 'Long-term care insurance',
    calculationType: FundingPolicyType.longTermCareInsurance,
    carrier: 'Mutual of Omaha',
  },
  {
    value: FundingPolicyType.jointMutualOfOmahaMutualcare,
    key: FundingPolicyType[
      FundingPolicyType.jointMutualOfOmahaMutualcare
    ] as FundingPolicyTypeDef['key'],
    label: 'MutualCare with Shared Care',
    isJoint: true,
    description: 'Long-term care insurance with shared benefits',
    calculationType: FundingPolicyType.longTermCareInsurance,
    genericType: FundingPolicyType.jointLongTermCareInsurance,
    carrier: 'Mutual of Omaha',
  },
];

export const fundingPolicyTypeDefs = Object.assign(
  toRecord(fundingPolicyTypeDefList, policyType => policyType.value),
  toRecord(fundingPolicyTypeDefList, policyType => policyType.key),
  toRecord(fundingPolicyTypeDefList, policyType => policyType.label),
);

export function checkPolicyCalculationTypeEquals(
  policyType: FundingPolicyType | null,
  equalsPolicyType: FundingPolicyType | FundingPolicyType[],
): boolean {
  if (!policyType) {
    return false;
  }

  const policyCalculationType =
    fundingPolicyTypeDefs[policyType].calculationType;

  if (Array.isArray(equalsPolicyType)) {
    return equalsPolicyType.includes(policyCalculationType);
  }

  return policyCalculationType === equalsPolicyType;
}
