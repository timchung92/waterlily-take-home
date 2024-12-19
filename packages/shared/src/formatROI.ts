// ... existing imports ...
import { formatPercent, formatThousands, isNullOrUndefined } from '.';

interface ROIValues {
  projectedReturnOnInvestment: number;
  projectedCompoundAnnualGrowthRate: number;
  projectedInternalRateOfReturn: number | undefined;
  investmentPeriodYears: number;
}

export function formatROI(
  values: ROIValues,
  calculationType: ReturnOnInvestmentCalculationType,
): string {
  const formatPercentToOneDecimal = (value: number) => formatPercent(value, 1);
  const formatYears = (years: number) =>
    `${formatThousands(years, '0', 1)} ${years === 1 ? 'yr' : 'yrs'}`;

  switch (calculationType) {
    case 'compoundAnnualGrowthRate':
      return `${formatPercentToOneDecimal(values.projectedCompoundAnnualGrowthRate)} (${formatYears(values.investmentPeriodYears)})`;
    case 'internalRateOfReturn':
      if (isNullOrUndefined(values.projectedInternalRateOfReturn)) {
        return 'Not calculable';
      }
      return `${formatPercentToOneDecimal(values.projectedInternalRateOfReturn)} (${formatYears(values.investmentPeriodYears)})`;
    case 'total':
    default:
      return formatPercentToOneDecimal(values.projectedReturnOnInvestment);
  }
}

export function getROILabel(
  calculationType: ReturnOnInvestmentCalculationType,
): string {
  switch (calculationType) {
    case 'internalRateOfReturn':
      return 'Annual IRR';
    case 'compoundAnnualGrowthRate':
      return 'Annual ROI';
    case 'total':
    default:
      return 'Total ROI';
  }
}
