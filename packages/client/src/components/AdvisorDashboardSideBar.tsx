import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from '@headlessui/react';
import { PiUserCircle } from 'react-icons/pi';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { Fragment, FunctionComponent } from 'react';
import { MdOutlineScreenSearchDesktop } from 'react-icons/md';
import { ChevronUpDownIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fullName,
  isNullUndefinedOrEmpty,
  logAudit,
  SessionType,
} from '@shared';
import { useNavigate } from 'react-router-dom';
import {
  selectMaybeSessionCognitoUser,
  selectSession,
  selectSessionAdvisor,
} from '../model/selectors';
import {
  About,
  AuthPasswordChange,
  closeSession,
  PageLink,
  AuthMFASetupExisting,
  DashboardActivePage,
  cn,
  WizardAdvisorHierarchy,
} from '..';
import { XMarkIcon } from '@heroicons/react/24/outline';

import { AdvisorDashboard } from '../pages/AdvisorDashboard';
import {
  MdInfoOutline,
  MdLogout,
  MdOutlineContactSupport,
  MdOutlinePhonelinkLock,
} from 'react-icons/md';
import { RiLockPasswordLine } from 'react-icons/ri';
import { IoMdLink } from 'react-icons/io';
import React from 'react';
import { Mails, Send, UserPen, WorkflowIcon } from 'lucide-react';
import { WizardAdvisorAdminPortal } from '@/pages/WizardAdvisorAdminPortal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type AdvisorDashboardSideBarProps = {
  advisorSideBarMobile: React.ReactNode;
  advisorSideBarContent: React.ReactNode;
};

const getContactSupportUrl = (advisor: Advisor) =>
  `https://waterlily.typeform.com/to/yXX4wrjU#email=${advisor.advisorEmail}&first_name=${advisor.advisorFirstName}&advisor_id=${advisor.advisorId}`;

export function AdvisorDashboardSideBar({
  advisorSideBarMobile,
  advisorSideBarContent,
}: AdvisorDashboardSideBarProps) {
  const dispatch = useDispatch();
  const cognitoUser = useSelector(selectMaybeSessionCognitoUser);
  const navigate = useNavigate();

  const handleClickSignOut = useCallback(() => {
    if (!isNullUndefinedOrEmpty(cognitoUser)) {
      logAudit(handleClickSignOut, 'Logout', {
        name: fullName,
      });
      cognitoUser.signOut();
      localStorage.removeItem('DevLocalBypassAuthPayload');
      dispatch(closeSession());
    }
    navigate('/');
  }, [navigate, dispatch, cognitoUser]);

  return (
    <>
      {/* Mobile sidebar */}
      {advisorSideBarMobile}
      {/* Static sidebar,  desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-darkPurple px-6 pb-4">
          {advisorSideBarContent}
        </div>
      </div>
    </>
  );
}

interface AdvisorUserMenuProps {
  handleClickSignOut: () => void;
  children: React.ReactNode;
}

function AdvisorUserMenu({
  children,
  handleClickSignOut,
}: AdvisorUserMenuProps) {
  const { sessionType } = useSelector(selectSession);
  const buttonStyle =
    'group w-full flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-darkPurple hover:bg-gray-200';

  const changePasswordLink = (
    <PageLink
      className={buttonStyle}
      to={AuthPasswordChange}
    >
      <RiLockPasswordLine
        className={classNames('text-darkPurple', 'h-6 w-6 shrink-0')}
        aria-hidden="true"
      />
      Change Password
    </PageLink>
  );
  const setUpMfaLink = (
    <PageLink
      className={buttonStyle}
      to={AuthMFASetupExisting}
    >
      <MdOutlinePhonelinkLock
        className={classNames('text-darkPurple', '-ml-1 h-6 w-6 shrink-0')}
        aria-hidden="true"
      />
      Setup MFA
    </PageLink>
  );
  const signOutButton = (
    <button
      className={buttonStyle}
      onClick={handleClickSignOut}
    >
      <MdLogout
        className={classNames('text-darkPurple ', 'h-6 w-6 shrink-0')}
        aria-hidden="true"
      />
      Sign Out
    </button>
  );
  const advisorHierarchyLink = (
    <PageLink
      className={buttonStyle}
      to={WizardAdvisorHierarchy}
    >
      <WorkflowIcon
        className={classNames('text-darkPurple', 'h-6 w-6 shrink-0')}
        aria-hidden="true"
      />
      Advisor Hierarchy
    </PageLink>
  );
  const advisorAdminPortalLink = (
    <PageLink
      className={buttonStyle}
      to={WizardAdvisorAdminPortal}
    >
      <UserPen
        className={classNames('text-darkPurple', 'h-6 w-6 shrink-0')}
        aria-hidden="true"
      />
      Advisor Admin Portal
    </PageLink>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60"
        align="start"
        side="top"
        sideOffset={10}
      >
        {sessionType === SessionType.wizard && (
          <>
            <DropdownMenuItem asChild>{advisorHierarchyLink}</DropdownMenuItem>
            <DropdownMenuItem asChild>
              {advisorAdminPortalLink}
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem asChild>{changePasswordLink}</DropdownMenuItem>
        <DropdownMenuItem asChild>{setUpMfaLink}</DropdownMenuItem>
        <DropdownMenuItem asChild>{signOutButton}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type AdvisorDashboardContentProps = {
  setShowIntakeFormLinkModal: (open: boolean) => void;
  setShowInviteClientModal: (open: boolean) => void;
  setShowBatchInviteModal: (open: boolean) => void;
  handleClickSignOut: () => void;
  activePage: DashboardActivePage;
  setActivePage: (page: DashboardActivePage) => void;
};

export function AdvisorDashboardSideBarContent({
  setShowIntakeFormLinkModal,
  setShowInviteClientModal,
  setShowBatchInviteModal,
  handleClickSignOut,
  activePage,
  setActivePage,
}: AdvisorDashboardContentProps) {
  const advisor = useSelector(selectSessionAdvisor);

  return (
    <>
      {renderLogoLink('https://joinwaterlily.com', 'Waterlily')}
      <nav className="flex flex-1 flex-col">
        <ul className="flex flex-1 flex-col gap-y-5">
          <li>
            <ul className="space-y-1">
              <div className="text-sm font-semibold leading-6 text-gray-400">
                Dashboard
              </div>
              <li key="clients">
                {renderNavLink(
                  AdvisorDashboard,
                  'Clients',
                  <HomeIcon />,
                  'bg-mediumPurple text-white',
                  activePage === 'clients',
                  { advisorId: '' },
                  () => setActivePage('clients'),
                )}
              </li>
              <li key="advisorProfile">
                {renderButton(
                  'Advisor Profile',
                  () => setActivePage('settings'),
                  <PiUserCircle />,
                  activePage === 'settings',
                )}
              </li>
            </ul>
          </li>
          <li>
            <ul className="space-y-1">
              <div className="text-sm font-semibold leading-6 text-gray-400">
                Actions
              </div>
              <li key="invite-client">
                {renderButton(
                  'Invite Client',
                  () => setShowInviteClientModal(true),
                  <Send />,
                )}
              </li>
              <li key="add-client">
                {renderButton(
                  'Intake Form Link',
                  () => setShowIntakeFormLinkModal(true),
                  <IoMdLink />,
                )}
              </li>
              <li key="add-client">
                {renderButton(
                  'Bulk Invite',
                  () => setShowBatchInviteModal(true),
                  <Mails />,
                )}
              </li>
            </ul>
          </li>
          <li>
            <div className="text-sm font-semibold leading-6 text-gray-400">
              Support
            </div>
            <ul className="-mx-2 mt-2 space-y-1">
              <li key="contact-support">
                {renderExternalLink(
                  getContactSupportUrl(advisor),
                  'Contact Support',
                  <MdOutlineContactSupport />,
                )}
              </li>
              <li key="help-desk">
                {renderExternalLink(
                  'https://help.joinwaterlily.com',
                  'Help Desk',
                  <MdOutlineScreenSearchDesktop />,
                )}
              </li>
              <li key="about">
                {renderNavLink(About, 'About', <MdInfoOutline />, '', false)}
              </li>
            </ul>
          </li>
          {renderAdvisorUserMenu(advisor, handleClickSignOut)}
        </ul>
      </nav>
    </>
  );
}

type AdvisorDashboardSideBarMobileProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  children: React.ReactNode;
};

export function AdvisorDashboardSideBarMobile({
  sidebarOpen,
  setSidebarOpen,
  children,
}: AdvisorDashboardSideBarMobileProps) {
  return (
    <Dialog
      className="relative z-50 lg:hidden"
      open={sidebarOpen}
      onClose={setSidebarOpen}
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-900/80 transition-opacity duration-100 ease-linear data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 flex">
        <DialogPanel
          transition
          className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-100 ease-in-out data-[closed]:-translate-x-full"
        >
          <TransitionChild>
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-100 ease-in-out data-[closed]:opacity-0">
              <button
                type="button"
                className="-m-2.5 p-2.5"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon
                  className="h-6 w-6 text-white"
                  aria-hidden="true"
                />
              </button>
            </div>
          </TransitionChild>
          {/* Sidebar component, mobile */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-darkPurple px-6 pb-4">
            {children}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

function renderAdvisorUserMenu(
  advisor: Advisor,
  handleClickSignOut: () => void,
) {
  return (
    <li className="mt-auto flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-mediumPurple ">
      <AdvisorUserMenu
        handleClickSignOut={handleClickSignOut}
        children={
          <button className="flex w-full items-center justify-between gap-3 hover:text-white">
            <div className="flex items-center gap-3">
              <Avatar className="">
                <AvatarFallback className="h-10 w-10 border border-white bg-white text-darkPurple ring-2 ring-inset ring-darkPurple">
                  {advisor.advisorFirstName.charAt(0) +
                    advisor.advisorLastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p className="text-base ">
                {advisor.advisorFirstName + ' ' + advisor.advisorLastName}
              </p>
            </div>
            <ChevronUpDownIcon className="h-6 w-6 shrink-0 text-gray-400 hover:text-white" />
          </button>
        }
      />
    </li>
  );
}

function renderNavLink(
  to: FunctionComponent<any>,
  label: string,
  icon: JSX.Element,
  bgClass: string,
  isActive: boolean,
  targetProps?: ObjectMap<any>,
  onClick?: () => void,
) {
  return (
    <PageLink
      to={to}
      targetProps={targetProps}
      onClick={onClick}
      className={cn(
        isActive
          ? bgClass
          : 'text-gray-400 hover:bg-mediumPurple hover:text-white',
        'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
      )}
    >
      {React.cloneElement(icon, {
        'className': cn(
          isActive ? 'text-white' : 'text-gray-400 group-hover:text-white',
          'h-6 w-6 shrink-0',
        ),
        'aria-hidden': 'true',
      })}
      {label}
    </PageLink>
  );
}

function renderButton(
  label: string,
  onClick: () => void,
  icon: JSX.Element,
  isActive?: boolean,
) {
  return (
    <button
      className={cn(
        isActive
          ? 'bg-mediumPurple text-white'
          : 'text-gray-400 hover:bg-mediumPurple hover:text-white',
        'group flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
      )}
      onClick={onClick}
    >
      {React.cloneElement(icon, {
        'className': cn(
          isActive ? 'text-white' : 'text-gray-400 group-hover:text-white',
          'h-6 w-6 shrink-0',
        ),
        'aria-hidden': 'true',
      })}
      {label}
    </button>
  );
}

function renderExternalLink(url: string, label: string, icon: JSX.Element) {
  return (
    <a
      className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-mediumPurple hover:text-white"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {React.cloneElement(icon, {
        'className': 'h-6 w-6 shrink-0 text-gray-400 group-hover:text-white',
        'aria-hidden': 'true',
      })}
      {label}
    </a>
  );
}

function renderLogoLink(url: string, label: string) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-16 shrink-0 items-center gap-3"
    >
      <div className="inline-block h-9 w-9 rounded-md bg-white text-center text-darkPurple">
        <p className="mt-1.5">W</p>
      </div>
      <p className="text-lg text-gray-100">{label}</p>
    </a>
  );
}
