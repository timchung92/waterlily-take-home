import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import classNames from 'classnames';
import { cn } from '@/lib';

type RadioOption = {
  label: string;
  description: string;
  value: string | number;
  id: string;
  disabled?: boolean;
};

type RadioSelectProps = {
  name: string;
  options: RadioOption[];
  selectedValue: string | number | null;
  onChange: (value: string | number) => void;
  className?: string;
};

export function RadioSelect({
  options,
  selectedValue,
  onChange,
  className,
}: RadioSelectProps) {
  return (
    <RadioGroup
      value={selectedValue?.toString()}
      onValueChange={value => onChange(value)}
      className={cn(className)}
    >
      {options.map(option => (
        <div
          key={option.value}
          className={cn(
            'flex items-center',
            option.disabled ? 'text-gray-400' : 'text-gray-700',
          )}
        >
          <RadioGroupItem
            value={option.value.toString()}
            id={option.id}
            disabled={option.disabled}
          />
          <Label
            htmlFor={option.id}
            className="ml-3 leading-6"
          >
            <span className="font-semibold">{option.label}</span>
            <span className="ml-1">
              <span className="sr-only">{option.label} </span>
              {option.description}
            </span>
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

export default RadioSelect;
