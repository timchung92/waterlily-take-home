import { FunctionComponent } from 'react';
import { IconType } from 'react-icons/lib';
import { VscSend } from 'react-icons/vsc';
import { MdDelete } from 'react-icons/md';
import {
  ERROR_OR_INCOMPLETE_STATUS_TAGS,
  ModalState,
  OnboardingDownloadReport,
  OnboardingResultsAreIn,
  cn,
  useNavigateToPage,
} from '..';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { LuUserCircle } from 'react-icons/lu';
import { RiLineChartLine } from 'react-icons/ri';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { LucideProps, MoreHorizontal, Users } from 'lucide-react';
import React from 'react';
import { AdvisorWarningDialog } from './AdvisorWarningDialog';

export function ClientActionMenu({
  client,
  sessionAdvisor,
  setModalState,
}: {
  client: Client;
  sessionAdvisor: Advisor;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
}) {
  function pickClientActions(client: Client) {
    const viewResultsAction = (
      <PageLinkAction
        to={OnboardingResultsAreIn}
        client={client}
        sessionAdvisor={sessionAdvisor}
        icon={RiLineChartLine}
      >
        View Results
      </PageLinkAction>
    );

    const skipToDownloadReportAction = (
      <PageLinkAction
        to={OnboardingDownloadReport}
        client={client}
        sessionAdvisor={sessionAdvisor}
        icon={IoDocumentTextOutline}
      >
        Download Report
      </PageLinkAction>
    );

    const addEditPartnerAction = (
      <ButtonAction
        onClick={() =>
          setModalState({
            type: 'linkPartner',
            client,
          })
        }
        icon={Users}
      >
        Link/Edit Partner
      </ButtonAction>
    );

    const sendMagicLinkAction = (
      <ButtonAction
        onClick={() =>
          setModalState({
            type: 'sendMagicLink',
            client,
          })
        }
        icon={VscSend}
      >
        Send Results Link
      </ButtonAction>
    );

    const deleteClientAction = (
      <ButtonAction
        onClick={() =>
          setModalState({
            type: 'delete',
            client,
          })
        }
        icon={MdDelete}
        className="text-red-500"
      >
        Delete Client
      </ButtonAction>
    );

    const viewClientDataAction = (
      <ButtonAction
        onClick={() =>
          setModalState({
            type: 'clientData',
            client,
          })
        }
        icon={LuUserCircle}
      >
        Intake Form Data
      </ButtonAction>
    );

    const fullActions = [
      viewResultsAction,
      addEditPartnerAction,
      skipToDownloadReportAction,
      viewClientDataAction,
      sendMagicLinkAction,
      deleteClientAction,
    ];

    const clientTags = client.clientTags;
    if (clientTags.some(tag => ERROR_OR_INCOMPLETE_STATUS_TAGS.includes(tag))) {
      return [deleteClientAction];
    }
    return fullActions;
  }
  const actions = pickClientActions(client);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 text-gray-700"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ActionMenu actions={actions} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ActionMenu({ actions }: { actions: React.ReactNode[] }) {
  return (
    <>
      {actions.map((action, index) => (
        <React.Fragment key={index}>
          {index === actions.length - 1 && index !== 0 && (
            <DropdownMenuSeparator />
          )}
          {action}
        </React.Fragment>
      ))}
    </>
  );
}

function PageLinkAction({
  to,
  icon: Icon,
  client,
  sessionAdvisor,
  children,
}: {
  to: FunctionComponent<ClientIdProps>;
  icon: IconType;
  sessionAdvisor: Advisor;
  client: Client;
  children: React.ReactNode;
}) {
  const navigateToPage = useNavigateToPage();

  const menuItem = (
    <DropdownMenuItem
      onClick={() => navigateToPage(to, { clientId: client.clientId })}
      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm"
    >
      <Icon className="h-4 w-4 text-gray-400" />
      {children}
    </DropdownMenuItem>
  );

  // You'll need to pass the sessionAdvisor and client as props to PageLinkAction
  if (sessionAdvisor.advisorId !== client.advisorId) {
    return (
      <AdvisorWarningDialog
        onContinue={() => navigateToPage(to, { clientId: client.clientId })}
      >
        {/* TODO: This is a bit of a hack because the dropdown menu item was causing the dialog to close when clicked */}
        <Button
          variant="ghost"
          className={cn(
            'relative flex w-full cursor-default select-none items-center justify-start gap-2 rounded-sm px-4 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
          )}
        >
          <Icon className="mr-1 h-4 w-4 text-gray-400" />
          {children}
        </Button>
      </AdvisorWarningDialog>
    );
  }

  return menuItem;
}

function ButtonAction({
  onClick,
  icon: Icon,
  children,
  className,
}: {
  onClick: () => void;
  icon:
    | IconType
    | React.ForwardRefExoticComponent<
        Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
      >;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DropdownMenuItem
      className={cn(
        `flex w-full items-center gap-3 px-4 py-2 text-left text-sm`,
        className,
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 text-gray-400" />
      {children}
    </DropdownMenuItem>
  );
}
