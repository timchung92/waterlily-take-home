import { formatCurrency } from '@shared';
import AnimatedText from './AnimatedText';

import { CiMoneyBill } from 'react-icons/ci';
import { PiChartPieSliceThin, PiTargetThin } from 'react-icons/pi';
import { formatPercent } from '@shared';
import { cn } from '@/lib/utils';
import { formatROI, getROILabel } from '@shared';

type MetricCardProps = {
  label: string;
  stat: number;
  formattedStat?: string; // New prop for pre-formatted stat
  subStatLabel: string;
  subStat: number;
  icon: React.ComponentType<{ className?: string }>;
  titleColor: string;
  bgColor: string;
  statFormatter?: (value: number) => string;
  delay: number;
};

export function MetricCard({
  label,
  formattedStat,
  stat,
  subStatLabel,
  subStat,
  icon: Icon,
  titleColor,
  bgColor,
  statFormatter = formatCurrency,
  delay,
}: MetricCardProps) {
  return (
    <div className={`rounded-xl px-4 py-5 sm:p-6 ${bgColor}`}>
      <dt className="flex justify-between text-base font-normal text-gray-700">
        {label}
        <Icon
          className="h-6 w-6 text-gray-400"
          aria-hidden="true"
        />
      </dt>
      <dd className="mt-1 flex flex-col items-baseline justify-between gap-1 md:block lg:flex">
        <div className={`text-xl font-semibold md:text-2xl ${titleColor}`}>
          <AnimatedText
            key={stat}
            text={formattedStat ?? statFormatter(stat)}
            delay={delay}
          />
        </div>
        <div className="flex w-full items-baseline justify-between">
          <span className="text-sm font-medium text-gray-500">
            {subStat === Infinity
              ? `${subStatLabel}: Unlimited`
              : `${subStatLabel}: ${formatCurrency(subStat)}`}
          </span>
        </div>
      </dd>
    </div>
  );
}

export const getMetricDefinitions = (client: Client) => {
  const {
    allPhaseCosts: {
      allPhaseInflatedProfessionalShareCost,
      allPhaseProfessionalShareCost,
    },
    fundingSources: {
      combinedProjectedCostCoverage,
      combinedProjectedCostCoveragePercent,
      combinedProjectedReturnOnInvestment,
      combinedProjectedCompoundAnnualGrowthRate,
      combinedProjectedInternalRateOfReturn,
      combinedInvestmentPeriodYears,
      combinedFundingTotalCost,
    },
    multipleFundingSources: { multiplePolicyTotalLtcBenefit },
    clientCalculationSettings: { returnOnInvestmentCalculationType },
  } = client;

  const formattedProjectedReturnOnInvestment = formatROI(
    {
      projectedReturnOnInvestment: combinedProjectedReturnOnInvestment ?? 0,
      projectedCompoundAnnualGrowthRate:
        combinedProjectedCompoundAnnualGrowthRate ?? 0,
      projectedInternalRateOfReturn: combinedProjectedInternalRateOfReturn,
      investmentPeriodYears: combinedInvestmentPeriodYears ?? 0,
    },
    returnOnInvestmentCalculationType,
  );

  const returnOnInvestmentLabel = getROILabel(
    returnOnInvestmentCalculationType,
  );

  return [
    {
      label: 'Projected LTC Cost',
      stat: allPhaseInflatedProfessionalShareCost,
      subStatLabel: "In today's dollars",
      subStat: allPhaseProfessionalShareCost,
      icon: PiTargetThin,
      titleColor: 'text-rose-500',
      bgColor: 'bg-rose-50',
    },
    {
      label: 'Projected LTC Coverage',
      stat: combinedProjectedCostCoverage ?? 0,
      formattedStat: `${combinedProjectedCostCoverage ? `${formatCurrency(combinedProjectedCostCoverage)} (${formatPercent(combinedProjectedCostCoveragePercent, 0)})` : '$0'}`,
      subStatLabel: 'Total LTC Benefit',
      subStat: multiplePolicyTotalLtcBenefit ?? 0,
      icon: PiChartPieSliceThin,
      titleColor: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      label: `Projected ${returnOnInvestmentLabel}`,
      stat: combinedProjectedReturnOnInvestment ?? 0,
      formattedStat: combinedProjectedReturnOnInvestment
        ? formattedProjectedReturnOnInvestment
        : '0%',
      subStatLabel: 'Total invested',
      subStat: combinedFundingTotalCost ?? 0,
      icon: CiMoneyBill,
      titleColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
    },
  ];
};

type FundingSourceMetricsProps = {
  client: Client;
  className?: string;
};

export default function FundingSourceMetrics({
  client,
  className,
}: FundingSourceMetricsProps) {
  const metrics = getMetricDefinitions(client);

  return (
    <div>
      <dl className={cn('grid grid-cols-1 gap-4 sm:grid-cols-3', className)}>
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.label}
            {...metric}
            delay={index * 200}
          />
        ))}
      </dl>
    </div>
  );
}
