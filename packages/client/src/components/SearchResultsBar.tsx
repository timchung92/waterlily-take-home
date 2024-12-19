import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import {
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Fuse from 'fuse.js';

interface SearchResultsBarProps<T> {
  handleSelect: (selected: T) => void;
  options: T[];
  createSearchLabel: (option: T) => string;
  createDescription: (option: T) => string;
  searchTypeName: string;
  className?: string;
  defaultOptions?: T[];
  defaultOptionsText?: string;
}

export function SearchResultsBar<T>({
  handleSelect,
  options,
  createSearchLabel,
  createDescription,
  searchTypeName,
  className,
  defaultOptions,
  defaultOptionsText,
}: SearchResultsBarProps<T>) {
  const [query, setQuery] = useState('');

  const optionsWithSearchLabel = options.map(option => ({
    ...option,
    searchLabel: createSearchLabel(option), // Add a new key with the result of the function
  }));

  const normalizeString = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/\s+/g, ' ') // Replace multiple spaces with one
      .trim()
      .toLowerCase();
  };
  const fuse = new Fuse(optionsWithSearchLabel, {
    keys: ['searchLabel'],
    threshold: 0.3, // Adjust for strictness
  });

  let filteredOptions: T[] =
    query === ''
      ? []
      : fuse.search(normalizeString(query)).map(result => result.item);

  const noQueryResults = query !== '' && filteredOptions.length === 0;
  const showDefaultOptions = noQueryResults && defaultOptions;
  if (showDefaultOptions) {
    filteredOptions = defaultOptions;
  }

  return (
    <div
      className={cn(
        'mx-auto w-full transform divide-y divide-gray-100 rounded-md bg-white ring-1 ring-gray-300 transition-all data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in',
        className,
      )}
    >
      <Combobox
        onChange={(option: T) => {
          if (option) {
            handleSelect(option);
            setQuery('');
          }
        }}
      >
        <div className="relative z-10">
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-4 top-3.5 hidden h-5 w-5 text-gray-400 md:block"
            aria-hidden="true"
          />
          <ComboboxInput
            className="h-12 w-full border-0 bg-transparent pl-4 pr-4 text-xs text-gray-900 placeholder:text-gray-400 focus:ring-0 md:pl-11 md:text-sm"
            placeholder={`Search for ${searchTypeName}`}
            onChange={event => setQuery(event.target.value)}
            onBlur={() => setQuery('')}
          />
        </div>

        {filteredOptions.length > 0 && (
          <ComboboxOptions
            static
            className="max-h-96 transform-gpu scroll-py-3 overflow-y-auto p-3"
          >
            {showDefaultOptions && (
              <NoResultsFound
                searchTypeName={searchTypeName}
                message={defaultOptionsText}
                className="mb-2 border-b border-gray-200 py-8"
              />
            )}
            {filteredOptions.map((option, idx) => (
              <ComboboxOption
                key={idx}
                value={option}
                className="group flex cursor-default select-none rounded-xl p-3 data-[focus]:bg-gray-100"
              >
                <div className="ml-4 flex-auto">
                  <p className="text-sm font-medium text-gray-700 group-data-[focus]:text-gray-900">
                    {createSearchLabel(option)}
                  </p>
                  <p className="text-sm text-gray-500 group-data-[focus]:text-gray-700">
                    {createDescription(option)}
                  </p>
                </div>
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        )}

        {noQueryResults && !defaultOptions && (
          <NoResultsFound searchTypeName={searchTypeName} />
        )}
      </Combobox>
    </div>
  );
}

function NoResultsFound({
  searchTypeName,
  className,
  message,
}: {
  searchTypeName: string;
  className?: string;
  message?: string;
}) {
  return (
    <div className={cn('px-6 py-14 text-center text-sm sm:px-14', className)}>
      <ExclamationCircleIcon
        type="outline"
        name="exclamation-circle"
        className="mx-auto h-6 w-6 text-gray-400"
      />
      <p className="mt-4 font-semibold text-gray-900">No results found</p>
      <p className="mt-2 text-gray-500">
        {message ||
          `No ${searchTypeName} found for this search term. Please try again.`}
      </p>
    </div>
  );
}
