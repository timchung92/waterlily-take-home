export function calcPrincipleAmount(futureValue: number, rate: number, period: number): number {
  return futureValue / Math.pow(1 + rate, period);
}