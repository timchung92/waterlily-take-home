import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';

type ButtonDropDownItem = {
  name: string;
  onClick: () => void;
  startIcon?: React.ReactNode;
};

type SplitButtonDropDownProps = {
  dropDownItems: ButtonDropDownItem[];
  buttonLabel: string;
  onClick: () => void;
  startIcon?: React.ReactNode;
  className?: string;
  primaryCta?: boolean;
};

export default function SplitButtonDropDown({
  dropDownItems,
  buttonLabel,
  onClick,
  startIcon,
  className,
  primaryCta,
}: SplitButtonDropDownProps) {
  const primaryCtaStyling = `bg-mediumPurple text-xs md:text-base text-white shadow-sm ring-gray-200 hover:bg-lightPurple`;
  const secondaryButtonStyling = `bg-white text-sm text-gray-900 ring-gray-300 hover:bg-gray-50`;
  return (
    <div className={classNames('inline-flex rounded-md shadow-sm', className)}>
      <button
        onClick={onClick}
        type="button"
        className={classNames(
          'relative flex w-full items-center gap-3 rounded-l-md px-5 py-2 ring-1 ring-inset focus:z-10',
          primaryCta ? primaryCtaStyling : secondaryButtonStyling,
        )}
      >
        {startIcon}
        {buttonLabel}
      </button>
      <Menu
        as="div"
        className="relative -ml-px block"
      >
        <MenuButton
          className={classNames(
            'relative inline-flex h-full items-center rounded-r-md px-2 py-2 ring-1 ring-inset focus:z-10',
            primaryCta ? primaryCtaStyling : secondaryButtonStyling,
          )}
        >
          <span className="sr-only">Open options</span>
          <ChevronDownIcon
            aria-hidden="true"
            className="h-5 w-5"
          />
        </MenuButton>
        <MenuItems
          transition
          className="absolute right-3 z-10 -mr-1 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
        >
          <div className="">
            {dropDownItems.map(item => (
              <MenuItem key={item.name}>
                <a
                  onClick={item.onClick}
                  className=" data-[focus]text-gray-900 flex cursor-pointer items-center gap-3 px-5 py-3 text-base text-gray-500  hover:text-gray-600 data-[focus]:bg-gray-100"
                >
                  {item.startIcon}
                  {item.name}
                </a>
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Menu>
    </div>
  );
}
