import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { findClientPartner, fullName, isNullOrUndefined } from '@shared';
import {
  ExclamationTriangleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Tooltip } from '@mui/material';
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { selectClients } from '../model/selectors';
import {
  ERROR_OR_INCOMPLETE_STATUS_TAGS,
  putClientPartnerLinkForClientByClientIdRequest,
} from '@client';
import { Modal } from './Modal';

interface LinkClientPartnerDialogProps {
  open: boolean;
  client: Client;
  onClose: () => void;
}

export function LinkClientPartnerDialog(props: LinkClientPartnerDialogProps) {
  const { open, onClose, client } = props;
  const dispatch = useDispatch();
  const clients = useSelector(selectClients);

  const [initialPartnerClient, setInitialPartnerClient] =
    useState<Client | null>(findClientPartner(client, clients) ?? null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(
    initialPartnerClient ?? null,
  );

  const isInitialClientDifferentFromSelectedClient =
    initialPartnerClient !== selectedClient;
  const isAlreadyPartneredError =
    selectedClient &&
    selectedClient.partnerClientId &&
    selectedClient.partnerClientId !== client.clientId;
  const enableSave =
    !isAlreadyPartneredError &&
    (selectedClient || isInitialClientDifferentFromSelectedClient);
  const isLastNameMismatch =
    selectedClient?.clientLastName !== client.clientLastName;

  function resetForm() {
    setInitialPartnerClient(findClientPartner(client, clients) ?? null);
    setSelectedClient(findClientPartner(client, clients) ?? null);
  }

  function handleSelectClient(client: Client) {
    setSelectedClient(client);
  }

  function handleUnlinkClient() {
    setSelectedClient(null);
  }

  function handleSave() {
    dispatch(
      putClientPartnerLinkForClientByClientIdRequest({
        clientId: client.clientId,
        partnerClientId: selectedClient?.clientId ?? null,
      }),
    );
    onClose();
  }

  useEffect(() => {
    // reset dialog only when opening
    if (!open) return;
    resetForm();
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${selectedClient ? 'Edit' : 'Link'} Partner for ${fullName(client)}`}
      subTitle={``}
      width="md"
      primaryButton={
        enableSave ? (
          <button
            type="button"
            className="hover:purple inline-flex w-full justify-center rounded-md bg-darkPurple px-10 py-2 text-base font-semibold text-white shadow-sm hover:bg-purple sm:ml-3 sm:w-auto"
            onClick={handleSave}
          >
            {initialPartnerClient && !selectedClient
              ? 'Confirm Unlink'
              : 'Save'}
          </button>
        ) : (
          <Tooltip
            title={
              <p className="text-sm">
                {isAlreadyPartneredError ? 'Fix errors' : 'Select a partner'}
              </p>
            }
          >
            <button
              type="button"
              className="inline-flex w-full cursor-not-allowed justify-center rounded-md bg-gray-200 px-8 py-2 text-base font-semibold text-gray-500 shadow-sm sm:ml-3 sm:w-auto"
              onClick={() => {}}
            >
              Save
            </button>
          </Tooltip>
        )
      }
    >
      <div
        className={`${selectedClient ? 'hidden' : ''} flex w-full items-start py-4`}
      >
        <ClientPartnerSearchBar
          client={client}
          clients={clients}
          handleSelectClient={handleSelectClient}
        />
      </div>

      {selectedClient && (
        <>
          <h2 className="mt-5  text-sm text-gray-900">Current partner</h2>
          <div className="flex items-center justify-between gap-x-6 pb-5 pt-3">
            <div className="flex min-w-0 gap-x-4">
              <ClientInitialsAvatar
                client={selectedClient}
                heightWidth={12}
              />
              <div className="my-1 min-w-0 flex-auto">
                <p className="text-base font-semibold leading-6 text-gray-900">
                  {fullName(selectedClient)}
                </p>
                <p className="truncate text-sm leading-5 text-gray-500">
                  {selectedClient.clientEmail}
                </p>
              </div>
            </div>
            <Tooltip title={<p className="text-sm">Remove</p>}>
              <button
                onClick={handleUnlinkClient}
                className="rounded-md px-1 py-1 font-semibold text-gray-500 hover:bg-gray-100"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </Tooltip>
          </div>

          {isLastNameMismatch && isInitialClientDifferentFromSelectedClient && (
            <div className="my-3">
              <LastNameMismatchWarning />
            </div>
          )}

          {isAlreadyPartneredError && (
            <div className="my-3">
              <AlreadyPartneredError selectedClient={selectedClient} />
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

interface ClientPartnerSearchBarProps {
  handleSelectClient: (client: Client) => void;
  clients: Client[];
  client: Client;
}

function ClientPartnerSearchBar({
  handleSelectClient,
  clients,
  client,
}: ClientPartnerSearchBarProps) {
  const [query, setQuery] = useState('');
  const currentClientId = client.clientId;
  const filteredClients: Client[] =
    query === ''
      ? []
      : clients.filter(searchClient => {
          const clientFullName = fullName(searchClient);
          const hasErrorOrIncompleteStatus = searchClient.clientTags?.some(
            tag => ERROR_OR_INCOMPLETE_STATUS_TAGS.includes(tag),
          );

          return (
            clientFullName.toLowerCase().includes(query.toLowerCase()) &&
            searchClient.clientId !== currentClientId &&
            searchClient.advisorId === client.advisorId &&
            !hasErrorOrIncompleteStatus
          );
        });

  return (
    <div className="mx-auto w-full  transform divide-y divide-gray-100 rounded-md bg-white ring-1 ring-gray-300 transition-all data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in">
      <Combobox
        onChange={(client: Client) => {
          if (client) {
            handleSelectClient(client);
            setQuery('');
          }
        }}
      >
        <div className="relative">
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
          <ComboboxInput
            autoFocus
            className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
            placeholder="Search for partner by name.."
            onChange={event => setQuery(event.target.value)}
            onBlur={() => setQuery('')}
          />
        </div>

        {filteredClients.length > 0 && (
          <ComboboxOptions
            static
            className="max-h-96 transform-gpu scroll-py-3 overflow-y-auto p-3"
          >
            {filteredClients.map(client => (
              <ComboboxOption
                key={client.clientId}
                value={client as Client}
                className="group flex cursor-default select-none rounded-xl p-3 data-[focus]:bg-gray-100"
              >
                <ClientInitialsAvatar client={client} />
                <div className="ml-4 flex-auto">
                  <p className="text-sm font-medium text-gray-700 group-data-[focus]:text-gray-900">
                    {fullName(client)}
                  </p>
                  <p className="text-sm text-gray-500 group-data-[focus]:text-gray-700">
                    {client.clientEmail}
                  </p>
                </div>
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        )}

        {query !== '' && filteredClients.length === 0 && (
          <div className="px-6 py-14 text-center text-sm sm:px-14">
            <ExclamationCircleIcon
              type="outline"
              name="exclamation-circle"
              className="mx-auto h-6 w-6 text-gray-400"
            />
            <p className="mt-4 font-semibold text-gray-900">No results found</p>
            <p className="mt-2 text-gray-500">
              No clients found for this search term. Please try again.
            </p>
          </div>
        )}
      </Combobox>
    </div>
  );
}

interface ClientInitialsAvatarProps {
  client: Client;
  heightWidth?: number;
}

function ClientInitialsAvatar({
  client,
  heightWidth,
}: ClientInitialsAvatarProps) {
  if (isNullOrUndefined(client)) {
    return null;
  }
  const applyHeightWidth = heightWidth ?? 10;
  return (
    <div
      className={`h-${applyHeightWidth} w-${applyHeightWidth} flex items-center justify-center rounded-md bg-purple text-center`}
    >
      <p className=" text-white">
        {client.clientFirstName.charAt(0) + client.clientLastName.charAt(0)}
      </p>
    </div>
  );
}

function LastNameMismatchWarning() {
  return (
    <div className="rounded-md bg-yellow-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon
            aria-hidden="true"
            className="h-5 w-5 text-yellow-400"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Last name mismatch
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              The last names of the clients you are linking does not match.
              Please confirm that you are linking the correct clients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AlreadyPartneredErrorProps {
  selectedClient: Client;
}

function AlreadyPartneredError({ selectedClient }: AlreadyPartneredErrorProps) {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon
            aria-hidden="true"
            className="h-5 w-5 text-red-400"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Already Linked Error
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              {fullName(selectedClient)} is already linked to another client.
              Please unlink their current partner in order to perform this
              action.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
