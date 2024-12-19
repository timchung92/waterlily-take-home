import { useState } from 'react';
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { cn } from '@/lib/utils';

export type ListBoxOptionDef<T> = {
  name: string;
  value: T;
};

type DrownDownProps<T> = {
  label: string | React.ReactNode;
  selectedOption: ListBoxOptionDef<T>;
  setSelected: (option: ListBoxOptionDef<T>) => void;
  options: ListBoxOptionDef<T>[];
  disabled?: boolean;
};

export function findOption<T>(
  options: ListBoxOptionDef<T>[],
  value?: T,
): ListBoxOptionDef<T> {
  return options.find(option => option.value === value) || options[0];
}

export const yesNoBooleanOptions: ListBoxOptionDef<boolean>[] = [
  { name: 'Yes', value: true },
  { name: 'No', value: false },
];

export function ListboxDropDown<T>({
  label,
  selectedOption,
  setSelected,
  options,
  disabled,
}: DrownDownProps<T>) {
  return (
    <Listbox
      value={selectedOption}
      onChange={setSelected}
      disabled={disabled}
    >
      <Label className="mb-1 block text-sm font-medium leading-6 text-gray-700 md:text-base">
        {label}
      </Label>
      <div className="relative w-1/2">
        <ListboxButton
          className={cn(
            `relative w-full cursor-default rounded-md bg-gray-100  py-1.5 pl-3 pr-10 text-left text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-purple sm:leading-6`,
            disabled ? 'bg-gray-100' : 'bg-white',
          )}
        >
          <span className="block truncate">{selectedOption?.name}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon
              aria-hidden="true"
              className="h-5 w-5 text-gray-400"
            />
          </span>
        </ListboxButton>

        <ListboxOptions
          transition
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm md:text-base"
        >
          {options.map((option, idx) => (
            <ListboxOption
              key={idx}
              value={option}
              className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-purple data-[focus]:text-white"
            >
              <span className="block truncate font-normal group-data-[selected]:font-semibold">
                {option.name}
              </span>

              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-purple group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
                <CheckIcon
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              </span>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
