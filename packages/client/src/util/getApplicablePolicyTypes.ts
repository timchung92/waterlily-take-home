import { useSelector } from 'react-redux';
import { selectClient, selectFeatureFlags } from '..';
import {
  FundingPolicyTypeDef,
  fundingPolicyTypeDefList,
  fundingPolicyTypeDefs,
} from '@shared';
import { orderBy } from 'lodash';

export function getApplicablePolicyTypes() {
  const { mutableClientPartner, multipleFundingSources } =
    useSelector(selectClient);
  const featureFlags = useSelector(selectFeatureFlags);
  const hasJointPolicy = checkIfHasJointPolicy(multipleFundingSources);

  const applicablePolicyTypes = fundingPolicyTypeDefList
    .filter(policyTypeDef =>
      passesFeatureFlagChecks(policyTypeDef, featureFlags),
    )
    .filter(policyTypeDef =>
      canShowJointPolicies(policyTypeDef, mutableClientPartner, hasJointPolicy),
    );

  return orderBy(applicablePolicyTypes, 'listPriority');
}

// Check if the client has a joint policy. For now, we don't allow multiple joint policies
// until we can copy the exact policy to the partner client
export function checkIfHasJointPolicy(
  multipleFundingSources: MultipleFundingSources,
): boolean {
  return Object.values(multipleFundingSources.ltcPolicy).some(
    policy =>
      policy.policyType && fundingPolicyTypeDefs[policy.policyType].isJoint,
  );
}

// Filter joint policies based on conditions
function canShowJointPolicies(
  policyTypeDef: FundingPolicyTypeDef,
  mutableClientPartner: Client | null,
  hasJointPolicy: boolean,
): boolean {
  const canShowIfJoint = mutableClientPartner || !policyTypeDef.isJoint; // Client must have a partner to show joint policies
  const canShowIfNoExistingJoint = !hasJointPolicy || !policyTypeDef.isJoint; // Don't show joint policies if they already exist
  return canShowIfJoint && canShowIfNoExistingJoint;
}

// Apply feature flag-based filtering
function passesFeatureFlagChecks(
  policyTypeDef: FundingPolicyTypeDef,
  featureFlags: any,
): boolean {
  // only show group policies if the feature flag is enabled
  if (policyTypeDef.isGroupPolicy && !featureFlags.vbShop) {
    return false;
  }
  return true;
}
