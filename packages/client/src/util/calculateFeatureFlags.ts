import { organizationDisplayNameIncludes } from '.';
import { FeatureFlagKeys, setFeatureFlag } from '../model/featureFlagsModel';
import { getDomainFromEmail } from '@shared';

export function calculateFeatureFlags(
  sessionAdvisor: Advisor | null,
  dispatch: any,
) {
  if (!sessionAdvisor) {
    return;
  }
  setFeatureFlagByOrganizationDisplayName(
    sessionAdvisor,
    dispatch,
    'vb shop',
    'vbShop',
  );
  setFeatureFlagByOrganizationDisplayName(
    sessionAdvisor,
    dispatch,
    'transamerica',
    'transamerica',
  );
  setFeatureFlagByOrganizationDisplayName(
    sessionAdvisor,
    dispatch,
    'western home',
    'fortifiedLife',
  );
  setFeatureFlagByOrganizationDisplayName(
    sessionAdvisor,
    dispatch,
    'new york life',
    'newYorkLife',
  );
  setFeatureFlagByEmailDomain(
    sessionAdvisor,
    dispatch,
    'ltcipartners.com',
    'ltciPartners',
  );
}

function setFeatureFlagByOrganizationDisplayName(
  sessionAdvisor: Advisor | null,
  dispatch: any,
  searchText: string,
  featureFlag: FeatureFlagKeys,
) {
  const advisorOrgIncludesSearchText = organizationDisplayNameIncludes(
    sessionAdvisor,
    searchText,
  );
  dispatch(
    setFeatureFlag({
      featureName: featureFlag,
      enabled: advisorOrgIncludesSearchText,
    }),
  );
}

function setFeatureFlagByEmailDomain(
  sessionAdvisor: Advisor | null,
  dispatch: any,
  searchDomain: string,
  featureFlag: FeatureFlagKeys,
) {
  if (!sessionAdvisor?.advisorEmail) {
    dispatch(
      setFeatureFlag({
        featureName: featureFlag,
        enabled: false,
      }),
    );
    return;
  }

  const emailDomain = getDomainFromEmail(sessionAdvisor.advisorEmail);
  if (!emailDomain) {
    dispatch(
      setFeatureFlag({
        featureName: featureFlag,
        enabled: false,
      }),
    );
    return;
  }

  const domainIncludesSearchText = emailDomain
    .toLowerCase()
    .includes(searchDomain.toLowerCase());

  dispatch(
    setFeatureFlag({
      featureName: featureFlag,
      enabled: domainIncludesSearchText,
    }),
  );
}
