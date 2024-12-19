import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { cn, selectSessionAdvisor } from '..';
import { useSelector } from 'react-redux';

const BUTTON_STYLE =
  'inline-flex items-center w-full justify-center gap-x-1.5 rounded-md bg-white text-sm px-3.5 py-2 font-semibold text-darkPurple shadow-sm ring-1 ring-inset ring-gray-300  hover:bg-gray-100 md:shadow-none';

function DropdownButton({ displayText }: { displayText: string }) {
  return (
    <MenuButton className={BUTTON_STYLE}>
      {displayText}
      <ChevronDownIcon
        aria-hidden="true"
        className="-mr-1 h-5 w-5 text-gray-400"
      />
    </MenuButton>
  );
}

type DropdownMenuItemProps = {
  href?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

function DropdownMenuItem({ href, children, onClick }: DropdownMenuItemProps) {
  return (
    <MenuItem>
      {({ active }) =>
        href ? (
          <a
            href={href}
            className={`block px-4 py-2 text-sm md:text-base ${
              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
            }`}
            target="_blank"
          >
            {children}
          </a>
        ) : (
          <button
            onClick={onClick}
            className={`block w-full px-4 py-2 text-left text-sm md:text-base ${
              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
            }`}
          >
            {children}
          </button>
        )
      }
    </MenuItem>
  );
}

function DropdownMenuItemsContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in">
      <div className="px-1 py-1">{children}</div>
    </MenuItems>
  );
}

type ContactAdvisorButtonProps = {
  requestMeetingOnClick: () => void;
  className?: string;
};

export function ContactAdvisorButton({
  requestMeetingOnClick,
  className,
}: ContactAdvisorButtonProps) {
  const advisor = useSelector(selectSessionAdvisor);
  const schedulingLinkDisplayText = advisor?.schedulingLinkDisplayText;
  if (!advisor) {
    return null;
  }
  const { schedulingLinkUrl } = advisor;

  if (!schedulingLinkUrl) {
    return (
      <div>
        <button
          className={cn(BUTTON_STYLE)}
          onClick={requestMeetingOnClick}
        >
          {schedulingLinkDisplayText ?? 'Connect with an advisor'}
        </button>
      </div>
    );
  }

  return (
    <Menu
      as="div"
      className={cn('relative inline-block text-left', className)}
    >
      <div>
        <DropdownButton
          displayText={schedulingLinkDisplayText ?? 'Connect with an advisor'}
        />
      </div>
      <DropdownMenuItemsContainer>
        {schedulingLinkUrl && (
          <DropdownMenuItem href={schedulingLinkUrl}>
            Schedule a Time
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={requestMeetingOnClick}>
          Request a Meeting
        </DropdownMenuItem>
      </DropdownMenuItemsContainer>
    </Menu>
  );
}
