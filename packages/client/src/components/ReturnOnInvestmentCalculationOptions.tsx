import { useState } from 'react';
import { Calculator, Info } from 'lucide-react';
import {
  cn,
  putClientCalculationSettingsByClientIdRequest,
  selectClient,
} from '..';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { Badge } from './ui/badge';

const roiDisplayOptions = [
  {
    value: 'total',
    label: ' Total ROI',
    description:
      'Total ROI shows the overall return by comparing the total paid out to what was paid in. (Total Payout - Cost) / Cost',
  },
  {
    value: 'compoundAnnualGrowthRate',
    label: 'Compound Annual Growth Rate',
    display: 'CAGR',
    description:
      'Compound Annualized Growth Rate (CAGR) provides a "smoothed out" growth rate that shows what the annual rate would have been if growth had occurred evenly over the entire period.',
  },
  // {
  //   value: 'internalRateOfReturn',
  //   label: 'Internal Rate of Return',
  //   description: `Internal Rate of Return (IRR) is the interest rate at which the present value of all future cash flows (both positive and negative) equals zero, or in simpler terms, it's the annual rate of growth that an investment is expected to generate.`,
  // },
] as const;

export function ReturnOnInvestmentCalculationOptions({
  discountRate,
  calculationType,
  onChange,
  className,
}: {
  discountRate: number | undefined | null;
  calculationType: ReturnOnInvestmentCalculationType;
  onChange: (value: ReturnOnInvestmentCalculationType) => void;
  className?: string;
}) {
  const dispatch = useDispatch();
  const { clientId } = useSelector(selectClient);
  const [open, setOpen] = useState(false);
  const [selectedRoiValue, setSelectedRoiValue] =
    useState<ReturnOnInvestmentCalculationType>(calculationType);
  const [discountRateState, setDiscountRateState] = useState<
    number | undefined | null
  >(discountRate);
  const [error, setError] = useState<string | null>(null);

  const handleApply = () => {
    setError(null);

    if (
      (selectedRoiValue === 'compoundAnnualGrowthRate' ||
        selectedRoiValue === 'internalRateOfReturn') &&
      discountRateState === undefined
    ) {
      setError('Discount rate is required for selected calculation');
      return;
    }

    onChange(selectedRoiValue);
    dispatch(
      putClientCalculationSettingsByClientIdRequest({
        clientId,
        clientCalculationSettings: {
          returnOnInvestmentCalculationType: selectedRoiValue,
          discountRate: discountRateState ?? null,
        },
      }),
    );
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant="link"
          role="combobox"
          size="sm"
          aria-expanded={open}
          className={cn(
            'flex items-center justify-start text-xs text-gray-500 hover:text-gray-900',
            className,
          )}
        >
          <Calculator
            strokeWidth={1.5}
            size={12}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-5 md:w-80">
        <div className="grid gap-4">
          <div className="flex items-baseline justify-between space-y-2 pb-1">
            <h4 className="font-medium leading-none">ROI Calculation Type</h4>
            <Badge variant="secondary">Beta</Badge>
          </div>
          <div className="grid gap-2 space-y-2">
            <div className="flex flex-col gap-2">
              <RadioGroup
                value={selectedRoiValue}
                onValueChange={value =>
                  setSelectedRoiValue(
                    value as ReturnOnInvestmentCalculationType,
                  )
                }
              >
                {roiDisplayOptions.map(option => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                    />
                    <Label
                      htmlFor={option.value}
                      className="flex items-baseline gap-1 text-xs md:text-sm"
                    >
                      {option.label}
                      <Tooltip
                        title={
                          <span className="text-sm">{option.description}</span>
                        }
                      >
                        <Info
                          strokeWidth={1.5}
                          size={12}
                          className="flex-shrink-0 text-gray-600"
                        />
                      </Tooltip>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="grid grid-cols-3 items-center gap-3 pt-1">
              <Label
                className="col-span-1 flex items-baseline gap-1"
                htmlFor="discountRate"
              >
                Discount Rate{' '}
                <Tooltip
                  title={
                    <div className="space-y-2">
                      <p className="text-sm">
                        The discount rate affects calculations only when there
                        are future investment payments rather than a single
                        upfront cost. When investments occur over time (like
                        ongoing premiums), a higher discount rate means those
                        future payments are valued less in today's terms. For
                        one-time investments, the discount rate has no impact
                        since there are no future payments to discount.
                      </p>
                    </div>
                  }
                >
                  <Info
                    strokeWidth={1.5}
                    size={12}
                    className="flex-shrink-0 text-gray-600"
                  />
                </Tooltip>
              </Label>
              <Input
                id="discountRate"
                value={discountRateState ?? ''}
                placeholder="Enter number (e.g. 5)"
                onChange={e =>
                  e.target.value
                    ? setDiscountRateState(Number(e.target.value))
                    : setDiscountRateState(undefined)
                }
                disabled={selectedRoiValue === 'total'}
                className="col-span-2 h-8"
              />
            </div>
            {error && <div className="text-sm text-red-500">{error}</div>}
            <Button
              size="sm"
              className="ml-auto w-24"
              onClick={handleApply}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Tooltip({
  children,
  title,
}: {
  children: React.ReactNode;
  title: React.ReactNode;
}) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80">{title}</HoverCardContent>
    </HoverCard>
  );
}
