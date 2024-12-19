export function calculateBMI(
  weightInPounds: number,
  heightInInches: number,
  roundToDecimal?: number,
): number {
  const bmi = (weightInPounds / (heightInInches * heightInInches)) * 703;
  return parseFloat(bmi.toFixed(roundToDecimal ?? 2));
}
