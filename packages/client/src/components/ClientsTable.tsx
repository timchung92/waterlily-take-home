import { createColumnHelper, Row, Table } from '@tanstack/react-table';
import { Button } from './ui/button';
import { Tooltip } from '@mui/material';

import {
  ActionTags,
  ClientActionMenu,
  ERROR_OR_INCOMPLETE_STATUS_TAGS,
  ModalState,
  OnboardingResultsAreIn,
  PageLink,
  selectAdvisorHierarchyState,
  selectSessionAdvisor,
  useNavigateToPage,
} from '..';
import React, { useEffect, useState } from 'react';
import { findClientPartner, fullName } from '@shared';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { MdOutlineFilterList } from 'react-icons/md';
import { useSelector } from 'react-redux';
import { AdvisorWarningDialog } from './AdvisorWarningDialog';
import {
  renderHeaderCell,
  renderTableCell,
  SortHeader,
} from './DataTableColumn';

const columnHelper = createColumnHelper<Client>();

type ClientTableColumnsProps = {
  data: Client[];
  sessionAdvisor: Advisor;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
};

function StatusHeader({ table }: { table: Table<Client> }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get unique tags from all clients
  const allTags = Array.from(
    new Set(
      table
        .getPreFilteredRowModel()
        .rows.flatMap(row => row.original.clientTags),
    ),
  );

  useEffect(() => {
    table.getColumn('statuses')?.setFilterValue(selectedTags);
  }, [selectedTags, table]);

  return (
    <div className="flex items-center gap-2">
      {renderHeaderCell('Statuses', 'ml-2')}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600"
          >
            <MdOutlineFilterList className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {allTags.map(tag => (
            <DropdownMenuCheckboxItem
              key={tag}
              className="pr-2 capitalize"
              checked={selectedTags.includes(tag)}
              onCheckedChange={checked => {
                setSelectedTags(prev =>
                  checked ? [...prev, tag] : prev.filter(t => t !== tag),
                );
              }}
            >
              {tag}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function OrganizationCell({ row }: { row: Row<Client> }) {
  const sessionAdvisor = useSelector(selectSessionAdvisor);
  const { subordinateAdvisors } = useSelector(selectAdvisorHierarchyState);

  return renderTableCell(
    getAdvisorOrganization(
      row.original.advisorId,
      subordinateAdvisors,
      sessionAdvisor,
    ),
    'ml-2',
  );
}

export const createClientTableColumns = ({
  data,
  setModalState,
  sessionAdvisor,
}: ClientTableColumnsProps) => [
  columnHelper.accessor(row => `${row.clientFirstName} ${row.clientLastName}`, {
    id: 'clientName',
    header: ({ column }) =>
      renderHeaderCell(
        <SortHeader
          column={column}
          children="Client Name"
        />,
        'ml-2',
      ),
    cell: info =>
      renderTableCell(
        <ClientName
          client={info.row.original}
          sessionAdvisor={sessionAdvisor}
        />,
      ),
    enableHiding: false,
  }),
  columnHelper.accessor('advisorId', {
    id: 'organization',
    header: ({ column }) =>
      renderHeaderCell(
        <SortHeader
          column={column}
          children="Organization"
        />,
      ),
    cell: info => <OrganizationCell row={info.row} />,
    enableHiding: true,
  }),
  columnHelper.accessor(row => clientPartnerFullName(row, data), {
    id: 'partner',
    header: () => renderHeaderCell('Partner'),
    cell: info => renderTableCell(info.getValue()),
  }),

  columnHelper.display({
    id: 'statuses',
    header: info => <StatusHeader table={info.table} />,
    cell: ({ row }) => {
      const client = row.original;
      return (
        <ActionTags
          clientTags={client.clientTags}
          client={client}
        />
      );
    },
    filterFn: (row, _columnId, filterValue: string[]) => {
      // If no tags are selected, show all rows
      if (!filterValue || filterValue.length === 0) return true;

      return filterValue.some(tag => row.original.clientTags.includes(tag));
    },
  }),
  columnHelper.accessor('clientEmail', {
    id: 'email',
    header: ({ column }) =>
      renderHeaderCell(
        <SortHeader
          column={column}
          children="Email"
        />,
      ),
    cell: info => renderTableCell(info.getValue()),
  }),
  columnHelper.accessor(row => row.clientAddedDateTime, {
    id: 'addedDate',
    header: ({ column }) =>
      renderHeaderCell(
        <SortHeader
          column={column}
          children="Added Date"
        />,
      ),
    cell: info => {
      const date = info.getValue();
      return renderTableCell(
        <Tooltip
          title={<span className="text-xs">{date.toLocaleTimeString()}</span>}
        >
          <span>{date.toLocaleDateString()}</span>
        </Tooltip>,
        'ml-2',
      );
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: () => renderHeaderCell('Actions'),
    cell: ({ row }) => {
      const client = row.original;
      return (
        <ClientActionMenu
          client={client}
          sessionAdvisor={sessionAdvisor}
          setModalState={setModalState}
        />
      );
    },
    enableHiding: false,
  }),
];

function ClientName({
  client,
  sessionAdvisor,
}: {
  client: Client;
  sessionAdvisor: Advisor;
}) {
  const clientTags = client.clientTags;
  const navigateToPage = useNavigateToPage();

  if (!clientCanViewResults(clientTags)) {
    return (
      <Button
        variant="ghost"
        className="text-gray-500"
        disabled
      >
        {fullName(client)}
      </Button>
    );
  }

  const clientNameButton = (
    <Button
      variant="ghost"
      className="font-semibold text-darkPurple"
    >
      {fullName(client)}
    </Button>
  );

  if (sessionAdvisor.advisorId !== client.advisorId) {
    return (
      <AdvisorWarningDialog
        onContinue={() => {
          navigateToPage(OnboardingResultsAreIn, { clientId: client.clientId });
        }}
      >
        {clientNameButton}
      </AdvisorWarningDialog>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <PageLink
        to={OnboardingResultsAreIn}
        targetProps={{ clientId: client.clientId }}
      >
        {clientNameButton}
      </PageLink>
    </div>
  );
}

function clientCanViewResults(clientTags: string[]) {
  return !clientTags.some(tag => ERROR_OR_INCOMPLETE_STATUS_TAGS.includes(tag));
}

function clientPartnerFullName(client: Client, fullClientList: Client[]) {
  const partner = findClientPartner(client, fullClientList);
  return partner ? fullName(partner) : '';
}

function getAdvisorOrganization(
  advisorId: string,
  subordinateAdvisors: Advisor[],
  sessionAdvisor: Advisor,
): string {
  if (advisorId === sessionAdvisor.advisorId) {
    return (
      sessionAdvisor.organizationDisplayName ||
      sessionAdvisor.organizationName ||
      ''
    );
  }
  const advisor = subordinateAdvisors.find(a => a.advisorId === advisorId);
  return advisor?.organizationDisplayName || advisor?.organizationName || '';
}
