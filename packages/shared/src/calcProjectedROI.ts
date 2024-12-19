import { isNullOrUndefined } from '@shared';

/**
 * Investment analysis results
 */
interface InvestmentAnalysis {
  investmentNPV: number;
  totalReturns: number;
  cagr: number;
  internalRateOfReturn: number | undefined;
  yearsToLastReturn: number;
}

/**
 * Sensitivity analysis result for different discount rates
 */
interface SensitivityResult {
  discountRate: number;
  cagr: number;
}

/**
 * Calculate NPV of investment payments
 */
export function calculateInvestmentNPV(
  investments: CashFlow[],
  discountRate: number,
): number {
  return investments.reduce((npv, investment) => {
    return (
      npv + investment.amount / Math.pow(1 + discountRate, investment.year)
    );
  }, 0);
}

/**
 * Calculate IRR for investment cash flows
 * Uses Newton-Raphson method for IRR calculation
 */
function calculateInvestmentIRR(
  investments: CashFlow[],
  returns: CashFlow[],
  discountRate: number,
): number | undefined {
  if (investments.length === 0 && returns.length === 0) {
    return 0;
  }

  // Create timeline of all cash flows
  let maxYear = Math.max(
    Math.max(...investments.map(p => p.year)) ?? 0,
    Math.max(...returns.map(b => b.year)) ?? 0,
    0,
  );

  if (isNullOrUndefined(maxYear) || Number.isNaN(maxYear)) {
    maxYear = 0;
  }

  const cashFlows = new Array(maxYear + 1).fill(0);

  // First try with original cash flows
  // Add investments as negative cash flows
  investments.forEach(investment => {
    cashFlows[investment.year] -= investment.amount ?? 0;
  });

  // Add returns as positive cash flows
  returns.forEach(returnFlow => {
    cashFlows[returnFlow.year] += returnFlow.amount ?? 0;
  });

  const result = calculateIRR(cashFlows);

  if (result !== undefined) {
    return result;
  }

  // If IRR calculation didn't converge, try with lumped investments
  const npvInvestments = calculateInvestmentNPV(investments, discountRate);

  // Reset cashflows array and use NPV as single investment at year 0
  cashFlows.fill(0);
  cashFlows[0] = npvInvestments;

  // Re-add returns
  returns.forEach(returnFlow => {
    cashFlows[returnFlow.year] += returnFlow.amount ?? 0;
  });

  return calculateIRR(cashFlows);
}

/**
 * Helper function to calculate IRR using Newton-Raphson method
 */
function calculateIRR(
  cashFlows: number[],
  guess: number = 0.1,
): number | undefined {
  const maxIterations = 1000;
  const tolerance = 0.0001;
  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    const npv = calculateNPVAtRate(cashFlows, rate);
    const derivative = calculateNPVDerivative(cashFlows, rate);

    const newRate = rate - npv / derivative;

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }

    rate = newRate;
  }

  return undefined;
}

/**
 * Helper function to calculate NPV at a given rate
 */
function calculateNPVAtRate(cashFlows: number[], rate: number): number {
  return cashFlows.reduce((npv, cf, index) => {
    return npv + cf / Math.pow(1 + rate, index);
  }, 0);
}

/**
 * Helper function to calculate NPV derivative
 */
function calculateNPVDerivative(cashFlows: number[], rate: number): number {
  return cashFlows.reduce((sum, cf, index) => {
    return sum - (index * cf) / Math.pow(1 + rate, index + 1);
  }, 0);
}

/**
 * Analyze investment returns
 */
export function analyzeInvestmentReturns(
  investments: CashFlow[],
  returns: CashFlow[],
  discountRateWholeNumber: number = 0,
  calculateIRR: boolean = false,
): InvestmentAnalysis {
  const discountRate = discountRateWholeNumber / 100;
  const investmentNPV = calculateInvestmentNPV(investments, discountRate);
  const totalReturns = returns.reduce((sum, r) => sum + r.amount, 0);
  const yearsToLastReturn = Math.max(...returns.map(r => r.year)) + 1; // +1 because we're using 0-indexed array

  let IRR = undefined;

  if (investmentNPV <= 0) {
    return {
      investmentNPV: 0,
      totalReturns,
      cagr: Infinity,
      internalRateOfReturn: calculateIRR ? Infinity : undefined,
      yearsToLastReturn,
    };
  }

  const cagr =
    Math.pow(totalReturns / investmentNPV, 1 / yearsToLastReturn) - 1;

  if (calculateIRR) {
    IRR = calculateInvestmentIRR(investments, returns, discountRate);
  }

  return {
    investmentNPV,
    totalReturns,
    cagr,
    internalRateOfReturn: IRR,
    yearsToLastReturn,
  };
}

/**
 * Perform sensitivity analysis
 */
export function performSensitivityAnalysis(
  investments: CashFlow[],
  returns: CashFlow[],
  discountRates: number[],
): SensitivityResult[] {
  const yearsToLastReturn = Math.max(...returns.map(r => r.year));
  const totalReturns = returns.reduce((sum, r) => sum + r.amount, 0);

  return discountRates.map(rate => {
    const npv = calculateInvestmentNPV(investments, rate);
    const cagr = Math.pow(totalReturns / npv, 1 / yearsToLastReturn) - 1;

    return {
      discountRate: rate,
      cagr,
    };
  });
}
