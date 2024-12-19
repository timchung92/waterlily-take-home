import { ReactNode } from 'react';
import styles from './Citations.module.css';
import { isFunction } from 'lodash';
import { useSelector } from 'react-redux';
import { selectClient, selectFeatureFlags } from '..';
import { annualHealthcareInflationRate } from '@shared/healthCareInflationRate';
import { formatCurrency, isNullUndefinedOrEmpty } from '@shared';
import classNames from 'classnames';

export interface DynamicCitationProps {
  client: Client;
  inferenceSet: InferenceSet;
  intakeSurvey: IntakeSurvey;
}

export interface DynamicCitationFunc {
  (props: DynamicCitationProps): ReactNode;
}

export var nationalAverageLtcCost = 172000;
export var yearOfLtcCostNationalStatistic = 2017;

export const citations: ObjectMap<ReactNode | DynamicCitationFunc> = {
  onboardingOurPredictionsLikelihoodNationalAverage: (
    <>
      <a
        href="https://aspe.hhs.gov/sites/default/files/documents/08b8b7825f7bc12d2c79261fd7641c88/ltss-risks-financing-2022.pdf"
        target="_blank"
        referrerPolicy="no-referrer"
      >
        1. 2022 U.S. Department of Health and Human Services
      </a>
    </>
  ),

  onboardingOurPredictionsLtcAtAgeRange: (
    <p>
      2. The predicted long-term care start age was determined using an
      alternate approach due to a lack of sufficient samples similar to the
      current user.
    </p>
  ),

  OnboardingProjectedCostsNationalAverage({ client }: DynamicCitationProps) {
    const { ltcAtYear } = client.appliedInferenceSet;
    return (
      <>
        <sup>1</sup> The average lifetime cost of{' '}
        {formatCurrency(nationalAverageLtcCost)}{' '}
        <a
          href="https://www.pwc.com/us/en/insurance/assets/pwc-insurance-cost-of-long-term-care.pdf?refID=3STREF"
          target="_blank"
          rel="noreferrer"
        >
          (source: 2017 study by PwC)
        </a>{' '}
        is adjusted for a {annualHealthcareInflationRate * 100}% annual
        healthcare inflation rate{' '}
        <a
          href="https://www.cms.gov/newsroom/press-releases/cms-office-actuary-releases-2022-2031-national-health-expenditure-projections"
          target="_blank"
          rel="noreferrer"
        >
          (source: cms.gov)
        </a>{' '}
        until {client.clientFirstName}&apos;s expected care begin year of{' '}
        {ltcAtYear}.
      </>
    );
  },
  OnboardingProjectedCostsPredictedEnvironments({
    client: { clientFirstName },
  }: DynamicCitationProps) {
    return (
      <>
        <sup>2</sup> These are the care environments we predict{' '}
        {clientFirstName} will use as his needs progress.
      </>
    );
  },
  OnboardingLtcOverviewDisclaimer({ client: { clientFullName } }) {
    return (
      <>
        {clientFullName}'s projected LTC cost and age they will need LTC are
        predictions from models trained on other families' LTC journeys. These
        predictions are estimates and are not guaranteed. {clientFullName}'s LTC
        costs may be higher or lower, and may begin sooner or later than what is
        shown here. There is no guarantee that a plan built on these numbers
        will cover {clientFullName}'s costs. The investing and insurance
        information provided on this page is for educational purposes only.
        Waterlily Caregiving, Inc. does not offer advisory or brokerage
        services, nor does it recommend or advise users to buy or sell
        particular stocks, securities insurance policies, or other financial
        products. Any information entered about an insurance policy is a subset
        of policy terms and can only be used to show an estimate of costs
        covered by a policy. Any policy will likely have terms that limit
        coverage beyond what is considered{' '}
        <a
          href="https://www.joinwaterlily.com/planning-for-yourself/disclosures-disclaimers"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          here
        </a>
        .
      </>
    );
  },
  OnboardingResultsAreInDisclaimer({ client: { clientFullName } }) {
    return (
      <>
        {clientFullName}'s projected long-term care (LTC) needs and costs, and
        age they will need LTC are predictions from models trained on other
        families' LTC journeys. These predictions are estimates and are not
        guaranteed. {clientFullName}'s LTC costs may be higher or lower, and may
        begin sooner or later, and may extend for longer or shorter durations
        than what is shown here. There is no guarantee that a plan built on
        these numbers will cover {clientFullName}'s costs. The investing and
        insurance information provided within this and other pages are for
        educational purposes only and have no bearing on any of {clientFullName}
        's existing insurance policies and/or claims with their insurance
        carrier. Waterlily Caregiving, Inc. does not offer advisory or brokerage
        services, nor does it recommend or advise users to buy or sell
        particular stocks, securities insurance policies, or other financial
        products. Any information entered about an insurance policy is a subset
        of policy terms and can only be used to show an estimate of costs
        covered by a policy. Any policy will likely have terms that limit
        coverage beyond what is considered in the pages that follow. Read more
        about what the predictive models intended use and what they can and
        cannot do{' '}
        <a
          href="https://www.joinwaterlily.com/planning-for-yourself/disclosures-disclaimers"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          here
        </a>
        .
      </>
    );
  },
  OnboardingFundingCoverageDisclaimer({ client: { clientFullName } }) {
    return (
      <>
        {clientFullName}'s projected long-term care (LTC) needs and costs, and
        age they will need LTC are predictions from models trained on other
        families' LTC journeys. These predictions are estimates and are not
        guaranteed. {clientFullName}'s LTC costs may be higher or lower, and may
        begin sooner or later, and may extend for longer or shorter durations
        than what is shown here. There is no guarantee that a plan built on
        these numbers will cover {clientFullName}'s costs. Any information
        entered about an insurance policy is a subset of policy terms and can
        only be used to show an estimate of costs covered by a policy. Any
        policy will likely have terms that limit coverage beyond what is
        considered in this and other pages, any predicted policy coverage is not
        guaranteed. The investing and insurance information provided within this
        and other pages are for educational purposes only. Waterlily does not
        offer advisory or brokerage services, nor does it recommend or advise
        users to buy or sell particular stocks, securities insurance policies,
        or other financial products. Read more about what the predictive models
        intended use and what they can and cannot do{' '}
        <a
          href="https://www.joinwaterlily.com/planning-for-yourself/disclosures-disclaimers"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          here
        </a>
        .
      </>
    );
  },
  OnboardingInsuranceDetailsDisclaimer({ client: { clientFullName } }) {
    const ltciPartnersFeatureFlag =
      useSelector(selectFeatureFlags).ltciPartners;
    return (
      <>
        Any information entered about an insurance policy or financial product
        is a subset of those policy or financial product terms and can only be
        used to show an estimate of costs covered by that policy or product. Any
        policy or product will likely have terms that limit coverage beyond what
        is considered in this and other pages. The coverage analysis will only
        be as accurate as the information provided and as the care predictions
        made. It is the user's responsibility to verify and correct the
        extracted information from policies uploaded to Waterlily, and to verify
        the calculations. You can view the calculations by clicking the policy
        name in the table above. Waterlily is not responsible for any
        inaccuracies in data extraction or financial modeling.
        {ltciPartnersFeatureFlag && (
          <p>
            All sales and purchases of insurance coverage are done through LTC
            Partners and based upon the advice and recommendations of LTC
            Partners licensed insurance brokers. Neither Waterlily nor Caregiver
            Action Network is assisting any consumer with the application for or
            purchase of insurance coverage nor making any recommendation
            concerning specific coverage types of insurance companies.
          </p>
        )}
      </>
    );
  },
};

interface CitationProps {
  citation: ReactNode | DynamicCitationFunc;
}
export function Citation({ citation }: CitationProps) {
  const client = useSelector(selectClient);
  const { appliedInferenceSet, intakeSurvey } = client;

  return (
    <div className={styles.citation}>
      {isFunction(citation)
        ? citation({ client, inferenceSet: appliedInferenceSet, intakeSurvey })
        : citation}
    </div>
  );
}

interface CitationsProps {
  citations?: (ReactNode | DynamicCitationFunc)[] | undefined;
  className?: string;
}
export function Citations({ citations, className }: CitationsProps) {
  if (isNullUndefinedOrEmpty(citations)) {
    return null;
  }

  return (
    <div
      className={classNames(
        'flex-none p-0 pt-5 text-xs font-light italic leading-4 text-black',
        className,
      )}
      style={{ fontFamily: 'Lato' }}
    >
      {citations.map((citation, index) => (
        <Citation
          key={index}
          citation={citation}
        />
      ))}
    </div>
  );
}
