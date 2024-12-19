export interface AnnualIncreaseResult {
  total: number;
  cashflows: CashFlow[];
}

export function calcTotalWithAnnualIncrease(
  monthlyAmount: number,
  annualIncreaseRate: number,
  increaseYears: number,
  totalYears: number,
): AnnualIncreaseResult {
  let total = 0;
  let currentMonthlyAmount = monthlyAmount;
  const cashflows: CashFlow[] = [];

  // First, calculate the total for the increase period
  for (let year = 0; year < increaseYears; year++) {
    const yearlyAmount = currentMonthlyAmount * 12;
    total += yearlyAmount;
    cashflows.push({
      year: year + 1,
      amount: yearlyAmount,
    });
    currentMonthlyAmount *= 1 + annualIncreaseRate;
  }

  // If there are remaining years after the increase period,
  // add them using the final monthly amount (after all increases)
  if (totalYears > increaseYears) {
    const remainingYears = totalYears - increaseYears;
    const yearlyAmount = currentMonthlyAmount * 12;

    for (let year = 0; year < remainingYears; year++) {
      cashflows.push({
        year: increaseYears + year + 1,
        amount: yearlyAmount,
      });
    }

    total += yearlyAmount * remainingYears;
  }

  return { total, cashflows };
}
