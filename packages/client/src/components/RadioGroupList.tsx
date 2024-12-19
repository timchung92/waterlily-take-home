import { Radio, RadioGroup } from '@headlessui/react';

export type OptionNameDescription<IdType> = {
  id: IdType;
  name: string;
  description: string;
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type RadioGroupListProps<IdType> = {
  options: OptionNameDescription<IdType>[];
  selected: IdType | null;
  setSelected: (id: IdType) => void;
  className?: string;
};

export default function RadioGroupList<IdType>({
  options,
  selected,
  setSelected,
  className,
}: RadioGroupListProps<IdType>) {
  return (
    <fieldset className={className ?? ''}>
      <RadioGroup
        value={selected}
        onChange={value => setSelected(value as IdType)}
        className="-space-y-px rounded-md bg-white"
      >
        {options.map((option, optionIdx) => (
          <Radio
            key={option.name}
            value={option.id}
            aria-label={option.name}
            aria-description={option.description}
            className={classNames(
              optionIdx === 0 ? 'rounded-tl-md rounded-tr-md' : '',
              optionIdx === options.length - 1
                ? 'rounded-bl-md rounded-br-md'
                : '',
              'group relative flex cursor-pointer border border-gray-200 p-4 focus:outline-none data-[checked]:z-10 data-[checked]:border-indigo-200 data-[checked]:bg-indigo-50',
            )}
          >
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white group-data-[checked]:border-transparent group-data-[checked]:bg-indigo-600 group-data-[focus]:ring-2 group-data-[focus]:ring-indigo-600 group-data-[focus]:ring-offset-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            <span className="ml-3 flex flex-col">
              <span className="block text-sm font-medium text-gray-900 group-data-[checked]:text-indigo-900">
                {option.name}
              </span>
              <span className="block text-sm text-gray-500 group-data-[checked]:text-indigo-700">
                {option.description}
              </span>
            </span>
          </Radio>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
