import { formatCurrency } from './formatCurrency';

export function formatUnlimitedCurrency(value: number | null) {
  return value === null ? 'Unlimited' : formatCurrency(value);
}
