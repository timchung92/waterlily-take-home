import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdvisorByAdvisorIdRequest,
  selectAppliedInferenceSet,
  selectClient,
  selectPartialAdvisor,
  selectSelfFundingContributionYears,
  selectSessionAdvisor,
} from '../model';
import slideStyles from './OnboardingPdfReport.module.css';
import { ChartDataPoint, HorizontalStackedLineChart } from '../components';
import {
  careEnvironmentDefs,
  carePhaseDefs,
  formatCurrency,
  formatDurationYears,
  formatInteger,
  formatPercent,
  formatThousands,
  fundingPolicyTypeDefs,
  isCarePhasePast,
  FundingPolicyType,
  isNullOrUndefined,
  isDurationCustom,
  checkPolicyCalculationTypeEquals,
} from '@shared';
import { memoize } from 'lodash';
import { cn } from '@/lib/utils';
import { defaultChartColors, isInferenceEdited } from '../util';
import { CareHoursChart } from '../components/CareHoursChart';

import mainStyles from '../styles/main.module.css';
import Divider from '@mui/material/Divider';
import CompanyLogoContainer from '../components/CompanyLogo';
import classnames from 'classnames';

const styles = {
  ...mainStyles,
  ...slideStyles,
};

const PDF_GENERATION_ADVISOR_ID = 'thr7-94h';

type CarePhaseDataPoint = ChartDataPoint & { carePhase: CarePhase | null };

const memoizedCalcChartData = memoize(function convertEachPhaseCostsToChartData(
  client: Client,
): CarePhaseDataPoint[] {
  const { phaseCosts } = client;

  return [
    ...phaseCosts.map(
      ({
        phaseInflatedProfessionalShareCost,
        carePhase,
        appliedCareEnvironment,
      }) => ({
        label: `${carePhaseDefs[carePhase].label}: ${isCarePhasePast(carePhase, client) ? 'Past' : careEnvironmentDefs[appliedCareEnvironment].label}`,
        value: phaseInflatedProfessionalShareCost,
        labelClassName: styles.stackedChartLabelSmall,
        carePhase,
      }),
    ),
  ];
});

export function OnboardingPdfReport() {
  const client = useSelector(selectClient)!;
  const sessionAdvisor = useSelector(selectSessionAdvisor);
  const contributionYears = useSelector(selectSelfFundingContributionYears);
  const rawChartData = memoizedCalcChartData(client);
  const dispatch = useDispatch();

  useEffect(() => {
    // if the advisor is pdf generation advisor
    if (sessionAdvisor.advisorId === PDF_GENERATION_ADVISOR_ID) {
      // assume the role of the client's advisor
      dispatch(fetchAdvisorByAdvisorIdRequest(client.advisorId));
    }
  }, [dispatch, sessionAdvisor.advisorId, client.advisorId]);

  const {
    allPhaseCosts: {
      allPhaseCareHoursProvided,
      allPhaseFamilyCareHoursProvided,
      allPhaseFamilyProvidedPercent,
      allPhaseProfessionalCareHoursProvided,
      allPhaseInflatedProfessionalShareCost,
      allPhaseCareMonthsNeeded,
    },
    fundingSources: {
      selfFunding: {
        hasSelfFunding,
        annualRateOfReturn,
        existingAssetsValue,
        monthlyContributionAmount,
        gainsTaxRate,
        monthlyIncomeTotal,
        selfFundingProjectedCostCoverage,
        selfFundingTotalValue,
        selfFundingProjectedReturnOnInvestment,
        selfFundingTotalCost,
        selfFundingNonLtcPayout,
      },
      annuity: {
        hasAnnuity,
        annuityAnnualPayOut,
        annuityAnnualPayoutForLtc,
        annuityAnnualPayoutForLtcPeriodYears,
        annuityExpectedPaymentEndAge,
        annuityExpectedPaymentStartAge,
        annuityPurchasePrice,
        annuityProjectedReturnOnInvestment,
        annuityTotalValue,
        annuityProjectedCostCoverage,
        annuityNonLtcPayout,
      },
    },
    intakeSurvey: { clientBirthYear, clientHasStartedLtc },
    multipleFundingSources,
    phaseCosts,
  } = client;
  const ltcPolicies = Object.values(multipleFundingSources.ltcPolicy).filter(
    ltcPolicy => !ltcPolicy.isDeactivated,
  );

  const { ltcLikelihoodEver, ltcAtAge } = useSelector(
    selectAppliedInferenceSet,
  );

  const ltcDurationYears = allPhaseCareMonthsNeeded / 12;
  const advisor = useSelector(selectPartialAdvisor);

  const contributionStartAtAge = contributionYears[0] - clientBirthYear;
  const contributionEndAtAge = contributionYears[1] - clientBirthYear;
  const contributionYearCount = contributionYears[1] - contributionYears[0];

  const selectedCarePhase = null;

  const anyCustomDurations = isDurationCustom(phaseCosts);

  const chartData =
    selectedCarePhase === null
      ? rawChartData
      : rawChartData.map((dataPoint, index) => ({
          barColor:
            dataPoint.carePhase === selectedCarePhase
              ? undefined
              : defaultChartColors[index] + '35',
          ...dataPoint,
        }));

  return (
    <div
      className={styles.PdfContainer}
      id="client-pdf-report"
    >
      <section className={styles.leftPanel}>
        {/* White labeling */}
        <CompanyLogoContainer
          advisor={advisor}
          containerClassName={styles.pdfBannerContainer}
          organizationNameClassName={styles.organizationName}
          subtextClassName={styles.bannerSubText}
        />
        {/* Client Name */}
        <div>
          <h2 className={classnames(styles.header, 'pb-2 pt-5')}>
            {client.clientFirstName} {client.clientLastName}
          </h2>
        </div>
        {/* Overview section */}
        <div>
          <p className="text-lg">
            Welcome to your long-term care plan report. This report provides a
            visual snapshot of your current financial care plan for you and your
            family to review.
          </p>
        </div>
        <Divider className="py-2" />
        {/* Funding section title */}
        <div>
          <h2 className={classnames(styles.header, 'py-5')}>
            Funding your Long Term Care
          </h2>

          <div>
            <h3 className="pb-1 text-xl font-bold">
              <span className="font-normal">
                {client.clientFirstName}'s{' '}
                {clientHasStartedLtc ? `remaining ` : 'projected'} costs
              </span>
              {': '}
              {formatCurrency(allPhaseInflatedProfessionalShareCost)}
            </h3>
          </div>
        </div>
        <div className={styles.chartRow}>
          <HorizontalStackedLineChart
            reducedFont
            className={classnames(styles.chart, 'w-full')}
            data={chartData}
            formatter={formatCurrency}
          />
        </div>
        <br />
        {/* Self Funding */}
        <div
          className={
            hasSelfFunding || existingAssetsValue || monthlyContributionAmount
              ? 'pt-2'
              : 'hidden'
          }
        >
          <div className="flex w-full items-center gap-2">
            <p className={classnames(styles.subtitle, 'text-base')}>
              Self-Funding
            </p>
            <div className="mt-1 flex-grow border-b border-gray-200" />
          </div>

          <div className="grid grid-cols-4 gap-x-3 gap-y-2 py-2">
            <div>
              <p className="text-[14px] font-light tracking-tighter">
                Today's Assets for LTC
              </p>
              <p>
                {isNullOrUndefined(existingAssetsValue)
                  ? '-'
                  : formatCurrency(existingAssetsValue)}
              </p>
            </div>
            {!clientHasStartedLtc && (
              <>
                <div>
                  <p className="text-[14px] font-light tracking-tighter">
                    Monthly Contribution
                  </p>
                  <p>
                    {isNullOrUndefined(monthlyContributionAmount)
                      ? '-'
                      : `${formatCurrency(monthlyContributionAmount)} over ${contributionYearCount} year${contributionYearCount === 1 ? '' : 's'}`}
                  </p>
                </div>
                <div>
                  <p className="text-[14px] font-light tracking-tighter">
                    ARR | Gains Tax
                  </p>
                  <p>
                    {`${isNullOrUndefined(annualRateOfReturn) ? '-' : formatPercent(annualRateOfReturn, 2)} | ${isNullOrUndefined(gainsTaxRate) ? '-' : formatPercent(gainsTaxRate, 2)}`}
                  </p>
                </div>
              </>
            )}
            <div>
              <p className="text-[14px] font-light tracking-tighter">
                Total Monthly Income
              </p>
              <p>
                {isNullOrUndefined(monthlyIncomeTotal)
                  ? '-'
                  : `${formatCurrency(monthlyIncomeTotal)}`}
              </p>
            </div>
          </div>
          {/* Self Funding Summary */}
          {!clientHasStartedLtc && (
            <FundingSourceSummaryRow
              totalCost={selfFundingTotalCost}
              totalCostLabel="Total Principal"
              projectedCostCoverage={selfFundingProjectedCostCoverage}
              nonLtcPayout={selfFundingNonLtcPayout}
              totalValue={selfFundingTotalValue}
              projectedTotalReturnOnInvestment={
                selfFundingProjectedReturnOnInvestment
              }
            />
          )}
        </div>
        {/* Annuity */}
        <div className={hasAnnuity ? 'pt-4' : 'hidden'}>
          <div className="flex w-full items-center gap-2">
            <p className={classnames(styles.subtitle, 'text-base')}>Annuity</p>
            <div className="mt-1 flex-grow border-b border-gray-200" />
          </div>
          <div className="grid grid-cols-4 gap-x-3 gap-y-2 py-2 text-base">
            <div>
              <p className="text-[14px] font-light tracking-tighter">
                Annual Payout
              </p>
              <p>
                {isNullOrUndefined(annuityAnnualPayOut)
                  ? '-'
                  : formatCurrency(annuityAnnualPayOut)}
              </p>
            </div>
            <div>
              <p className="text-[14px] font-light tracking-tighter">
                LTC Annual Payout
              </p>
              <p>
                {isNullOrUndefined(annuityAnnualPayoutForLtc)
                  ? '-'
                  : formatCurrency(annuityAnnualPayoutForLtc)}
              </p>
            </div>
            <div>
              <p className="text-[14px] font-light tracking-tighter">
                LTC Payout Period
              </p>
              <p>
                {isNullOrUndefined(annuityAnnualPayoutForLtcPeriodYears)
                  ? '-'
                  : formatInteger(annuityAnnualPayoutForLtcPeriodYears) +
                    ' years'}
              </p>
            </div>
            <div>
              <p className="text-[14px] font-light tracking-tighter">
                Expected Payout Duration
              </p>
              <p>
                {isNullOrUndefined(annuityExpectedPaymentStartAge)
                  ? '-'
                  : `Ages ${formatInteger(annuityExpectedPaymentStartAge)}-${formatInteger(annuityExpectedPaymentEndAge)}`}
              </p>
            </div>
          </div>
          {/* Annuity summary */}
          <FundingSourceSummaryRow
            totalCost={annuityPurchasePrice}
            totalCostLabel="Purchase Price"
            projectedCostCoverage={annuityProjectedCostCoverage}
            nonLtcPayout={annuityNonLtcPayout}
            totalValue={annuityTotalValue}
            projectedTotalReturnOnInvestment={
              annuityProjectedReturnOnInvestment
            }
          />
        </div>
        {/* Policy */}
        <div id="policy-section">
          {ltcPolicies.map((ltcPolicy, index) => {
            if (index !== 0) {
              return null;
            }
            return (
              <div className={'pt-4'}>
                <div className="flex w-full items-center gap-2">
                  <p className={classnames(styles.subtitle, 'text-base')}>
                    {ltcPolicy.policyType
                      ? fundingPolicyTypeDefs[ltcPolicy.policyType!].label
                      : 'LTC Policy'}
                  </p>
                  <div className="mt-1 flex-grow border-b border-gray-200" />
                </div>
                <p
                  className={`${ltcPolicies.length > 1 ? 'text-sm italic text-gray-400' : 'hidden'}`}
                >
                  Only 1 out of {ltcPolicies.length} policies shown. Refer to
                  financial planning page for full details.
                </p>

                <div className="grid grid-cols-4 gap-x-3 gap-y-2 py-2 text-base">
                  {clientHasStartedLtc ? (
                    <div>
                      <p className="text-[14px] font-light tracking-tighter">
                        Remaining Benefit Amount
                      </p>
                      <p>
                        {isNullOrUndefined(ltcPolicy.policyMaximumBenefitAmount)
                          ? 'Unlimited'
                          : formatCurrency(
                              ltcPolicy.policyMaximumBenefitAmount +
                                (ltcPolicy.policyContinuationBenefitAmount ??
                                  0) -
                                (ltcPolicy.policyBenefitUtilizedToDate ?? 0),
                            )}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[14px] font-light tracking-tighter">
                        {checkPolicyCalculationTypeEquals(
                          ltcPolicy.policyType,
                          [
                            FundingPolicyType.hybridLifeInsurance,
                            FundingPolicyType.lifeInsuranceWithRider,
                          ],
                        )
                          ? 'Death Benefit'
                          : 'Max Benefit Amount'}
                      </p>
                      <p>
                        {isNullOrUndefined(ltcPolicy.policyMaximumBenefitAmount)
                          ? 'Unlimited'
                          : formatCurrency(
                              ltcPolicy.policyMaximumBenefitAmount,
                            )}
                      </p>
                    </div>
                  )}
                  {checkPolicyCalculationTypeEquals(
                    ltcPolicy.policyType,
                    FundingPolicyType.hybridLifeInsurance,
                  ) && (
                    <div>
                      <p className="text-[14px] font-light tracking-tighter">
                        COB Amount
                      </p>
                      <p>
                        {isNullOrUndefined(
                          ltcPolicy.policyContinuationBenefitAmount,
                        )
                          ? 'Unlimited'
                          : formatCurrency(
                              ltcPolicy.policyContinuationBenefitAmount,
                            )}
                      </p>
                    </div>
                  )}

                  {checkPolicyCalculationTypeEquals(ltcPolicy.policyType, [
                    FundingPolicyType.hybridLifeInsurance,
                    FundingPolicyType.lifeInsuranceWithRider,
                  ]) && (
                    <div>
                      <p className="text-[14px] font-light tracking-tighter">
                        Guaranteed Death Benefit
                      </p>
                      <p>
                        {formatCurrency(
                          ltcPolicy.policyMinimumGuaranteedBenefitAmount ?? 0,
                        )}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-[14px] font-light tracking-tighter">
                      Policy Purchase Year
                    </p>
                    <p>
                      {isNullOrUndefined(ltcPolicy.policyPremiumStartYear)
                        ? '-'
                        : formatInteger(ltcPolicy.policyPremiumStartYear)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[14px] font-light tracking-tighter">
                      Home/Facility Waiting Period
                    </p>
                    <p>
                      {`${formatThousands(ltcPolicy.homeCareWaitingPeriodDays ?? 0)}/${formatThousands(ltcPolicy.facilityCareWaitingPeriodDays ?? 0)} days`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[14px] font-light tracking-tighter">
                      Monthly Premium
                    </p>
                    <p>
                      {isNullOrUndefined(ltcPolicy.policyPremiumMonthlyCost)
                        ? '-'
                        : formatCurrency(ltcPolicy.policyPremiumMonthlyCost)}
                    </p>
                  </div>
                  <div
                    className={cn(
                      ltcPolicy.policyPremiumIncreaseRate ? '' : 'hidden',
                    )}
                  >
                    <p className="text-[14px] font-light tracking-tighter">
                      Premium Increase Rate
                    </p>
                    <p>{formatPercent(ltcPolicy.policyPremiumIncreaseRate)}</p>
                  </div>
                  <div
                    className={cn(
                      ltcPolicy.policyLimitedPayYears ? '' : 'hidden',
                    )}
                  >
                    <p className="text-[14px] font-light tracking-tighter">
                      Limited Pay Period
                    </p>
                    <p>{formatThousands(ltcPolicy.policyLimitedPayYears!)}</p>
                  </div>
                  <div>
                    <p className="text-[14px] font-light tracking-tighter">
                      Lump-Sump Payment
                    </p>
                    <p>
                      {isNullOrUndefined(ltcPolicy.policyLumpSumPayment)
                        ? '-'
                        : formatThousands(ltcPolicy.policyLumpSumPayment)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[14px] font-light tracking-tight">
                      Home Care Max
                    </p>
                    <p>
                      {isNullOrUndefined(ltcPolicy.dailyHomeBenefitAmount)
                        ? '-'
                        : formatCurrency(ltcPolicy.dailyHomeBenefitAmount) +
                          '/day'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[14px] font-light tracking-tighter">
                      Independent Living Max
                    </p>
                    <p>
                      {isNullOrUndefined(
                        ltcPolicy.dailyIndependentLivingBenefitAmount,
                      )
                        ? '-'
                        : formatCurrency(
                            ltcPolicy.dailyIndependentLivingBenefitAmount,
                          ) + '/day'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[14px] font-light tracking-tighter">
                      Assisted Living Max
                    </p>
                    <p>
                      {isNullOrUndefined(
                        ltcPolicy.dailyAssistedLivingBenefitAmount,
                      )
                        ? '-'
                        : formatCurrency(
                            ltcPolicy.dailyAssistedLivingBenefitAmount,
                          ) + '/day'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[14px] font-light tracking-tighter">
                      Nursing Home Max
                    </p>
                    <p>
                      {isNullOrUndefined(
                        ltcPolicy.dailyNursingHomeBenefitAmount,
                      )
                        ? '-'
                        : formatCurrency(
                            ltcPolicy.dailyNursingHomeBenefitAmount,
                          ) + '/day'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[14px] font-light tracking-tighter">
                      Inflation Protection
                    </p>
                    <p>
                      {isNullOrUndefined(ltcPolicy.policyInflationProtection)
                        ? '-'
                        : formatPercent(
                            ltcPolicy.policyInflationProtection,
                            2,
                          ) +
                          ` (${ltcPolicy.isSimpleInflationProtection ? 'Simple' : 'Compound'})`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[14px] font-light tracking-tighter">
                      Payment Type
                    </p>
                    <p>
                      {isNullOrUndefined(ltcPolicy.isIndemnityPolicyPayment) ||
                      ltcPolicy.isIndemnityPolicyPayment === false
                        ? 'Reimbursement'
                        : 'Indemnity'}
                    </p>
                  </div>
                </div>
                {/* Policy Summary */}
                <FundingSourceSummaryRow
                  totalCost={ltcPolicy.policyTotalCost}
                  totalCostLabel="Paid in Premiums"
                  projectedCostCoverage={
                    clientHasStartedLtc
                      ? ltcPolicy.policyCoverageOfRemainingLtcCosts
                      : ltcPolicy.projectedCostCoverage
                  }
                  nonLtcPayout={ltcPolicy.policyNonLtcPayout}
                  totalValue={ltcPolicy.policyTotalValue}
                  projectedTotalReturnOnInvestment={
                    ltcPolicy.policyProjectedReturnOnInvestment
                  }
                />
              </div>
            );
          })}
        </div>

        {/* Combined Metrics */}
        <div className="pt-4"></div>
        <PdfCombinedMetrics />
        {/* Disclosures section */}
        <div className="py-3">
          <p className={styles.disclosures}>
            {client.clientFirstName}'s projected LTC cost and age they will need
            LTC are predictions from models trained on other families' LTC
            journeys. These predictions are estimates and are not guaranteed.{' '}
            {client.clientFirstName}'s LTC costs may be higher or lower, and may
            begin sooner or later than what is shown here. There is no guarantee
            that a plan built on these numbers will cover{' '}
            {client.clientFirstName}'s costs. The investing and insurance
            information provided on this page is for educational purposes only.
            Waterlily Caregiving, Inc. does not offer advisory or brokerage
            services, nor does it recommend or advise users to buy or sell
            particular stocks, securities insurance policies, or other financial
            products. Any information entered about an insurance policy is a
            subset of policy terms and can only be used to show an estimate of
            costs covered by a policy. Any policy will likely have terms that
            limit coverage beyond what is considered here. Additional
            disclaimers and disclosures on our models can be found on our site:
            https://www.joinwaterlily.com/planning-for-yourself/disclosures-disclaimers
          </p>
        </div>
      </section>

      {/* Right panel */}
      <section className="flex flex-col items-center bg-[#DDDCF5] px-3 pb-4 pt-12 text-center">
        <div className={styles.ltcStats}>
          {
            // Only show the likelihood of LTC if the client has not started LTC
            !clientHasStartedLtc && (
              <div>
                <h4 className="pt-6 text-xl font-semibold">
                  Likelihood of Long-Term Care
                </h4>
                <p className="my-4 text-center text-4xl font-bold">
                  {formatPercent(ltcLikelihoodEver, 0)}
                </p>
                <p className="text-center text-base">National Average: 56%</p>
              </div>
            )
          }
          {
            // Only show the start of care if the client has not started LTC
            !clientHasStartedLtc && (
              <div>
                <h4 className="text-xl font-semibold">Start of care</h4>
                <p className="my-2 text-4xl font-bold">{ltcAtAge}</p>
                <p className="text-xl">
                  years old
                  {isInferenceEdited(client, 'ltcAtAge') ? ' (edited)' : ''}
                </p>
              </div>
            )
          }

          <div className={styles.statContainer}>
            <h4 className="text-xl font-semibold">
              {clientHasStartedLtc ? 'Remaining care' : 'Length of care'}
            </h4>
            <p className="my-2 text-4xl font-bold">
              {formatDurationYears(ltcDurationYears)}
            </p>
            <p className="text-xl">years {anyCustomDurations && ' (edited)'}</p>
          </div>

          <div className="pl-2 text-center">
            <p className="-ml-1 text-xl font-semibold">
              {clientHasStartedLtc
                ? 'Remaining Care Hours'
                : 'Total Care Hours'}
            </p>
            <div className={styles.column}>
              <div className={styles.chartContainer}>
                <CareHoursChart
                  allPhaseFamilyProvidedPercent={allPhaseFamilyProvidedPercent}
                />
                <div className={styles.totalDataLabelContainer}>
                  <div className={styles.totalDataLabelValue}>
                    {formatThousands(allPhaseCareHoursProvided)}
                  </div>
                </div>
              </div>
            </div>
            <div className="pl-1">
              <p className="mt-8 font-semibold">Professional Care Services</p>
              <p className="">
                <b className="font-semibold text-[#382377]">
                  {formatThousands(allPhaseProfessionalCareHoursProvided)}
                </b>{' '}
                hours
              </p>
              <p className="mt-4 font-semibold">Family Provided</p>
              <p className=" ">
                <b className="font-semibold text-[#6C60BF]">
                  {formatThousands(allPhaseFamilyCareHoursProvided)}
                </b>{' '}
                hours
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface FundingSourceSummaryRowProps {
  totalCost: number | undefined | null;
  totalCostLabel: string;
  projectedCostCoverage: number | undefined;
  nonLtcPayout: number | undefined;
  totalValue: number | undefined;
  projectedTotalReturnOnInvestment: number | undefined;
}

function FundingSourceSummaryRow(props: FundingSourceSummaryRowProps) {
  return (
    <div className="mt-1 grid grid-cols-5 gap-x-3 gap-y-2 divide-x rounded-lg bg-gray-50 px-3 py-2 text-center text-base">
      <div className="flex flex-col justify-center">
        <p className="text-xs font-light tracking-tighter">
          {props.totalCostLabel}
        </p>
        <p className="text-red-500">
          {isNullOrUndefined(props.totalCost)
            ? '-'
            : formatCurrency(props.totalCost)}
        </p>
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-xs font-light tracking-tighter">LTC Payout</p>
        <p className="text-green-600">
          {isNullOrUndefined(props.projectedCostCoverage)
            ? '-'
            : formatCurrency(props.projectedCostCoverage)}
        </p>
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-xs font-light tracking-tighter">Non-LTC Payout</p>
        <p className="">
          {isNullOrUndefined(props.nonLtcPayout)
            ? '-'
            : formatCurrency(props.nonLtcPayout)}
        </p>
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-xs font-light tracking-tighter">Total Payout</p>
        <p className="">
          {isNullOrUndefined(props.totalValue)
            ? '-'
            : formatCurrency(props.totalValue)}
        </p>
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-xs font-light tracking-tighter">ROI</p>
        <p>
          {isNullOrUndefined(props.projectedTotalReturnOnInvestment)
            ? '-'
            : formatPercent(props.projectedTotalReturnOnInvestment, 2)}
        </p>
      </div>
    </div>
  );
}

function PdfCombinedMetrics() {
  const {
    fundingSources: {
      combinedFundingTotalCost,
      combinedProjectedCostCoverage,
      combinedProjectedReturnOnInvestment,
      combinedTotalValue,
      combinedProjectedCostCoveragePercent,
      combinedNonLtcPayout,
    },
  } = useSelector(selectClient);

  return (
    <div className="my-4 grid w-full grid-cols-3 divide-x-2 divide-y-2 rounded-lg  bg-[#DDDCF5] text-center ">
      <div className="flex flex-col items-center justify-center px-2 py-3">
        <p className="text-xs ">TOTAL INVESTED</p>
        <span className="text-lg font-semibold">
          {formatCurrency(combinedFundingTotalCost ?? 0)}
        </span>
      </div>
      <div className="flex flex-col items-center justify-center px-2 py-3">
        <p className="text-xs ">LTC COVERAGE </p>
        <span className="text-lg font-semibold">
          {formatCurrency(combinedProjectedCostCoverage ?? 0)}
        </span>
      </div>
      <div className="flex flex-col items-center justify-center rounded-bl-lg border-t-2 px-2 py-3">
        <p className="text-xs ">NON-LTC PAYOUT </p>
        <span className="text-lg font-semibold">
          {formatCurrency(combinedNonLtcPayout ?? 0)}
        </span>
      </div>
      <div className="flex flex-col items-center justify-center px-2 py-3">
        <p className="text-xs ">TOTAL PAYOUT</p>
        <span className="text-lg font-semibold">
          {formatCurrency(combinedTotalValue ?? 0)}
        </span>
      </div>
      <div className="flex flex-col items-center justify-center rounded-tr-lg px-2 py-3">
        <p className="text-xs ">LTC COVERAGE %</p>
        <span className="text-lg font-semibold">
          {formatPercent(combinedProjectedCostCoveragePercent ?? 0, 2)}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center px-2 py-3">
        <p className="text-xs ">COMBINED ROI </p>
        <span className="text-lg font-semibold">
          {formatPercent(combinedProjectedReturnOnInvestment ?? 0, 2)}
        </span>
      </div>
    </div>
  );
}
