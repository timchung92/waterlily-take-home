export function calcFutureValueSimpleInflation(
  principal: number,
  yearsOfGrowth: number,
  annualRateOfReturn: number,
): number {
  const growthPerYear = principal * annualRateOfReturn;
  const totalInterest = growthPerYear * yearsOfGrowth;

  return principal + totalInterest;
}
