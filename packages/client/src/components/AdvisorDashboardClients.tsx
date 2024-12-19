import { BsFillSendPlusFill, BsSendPlus } from 'react-icons/bs';

import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fullName, isNullUndefinedOrEmpty, logAudit } from '@shared';
import { useNavigate } from 'react-router-dom';
import {
  selectClients,
  selectClientsIsLoading,
  selectClientsSearchText,
  selectMaybeSessionCognitoUser,
  selectSessionAdvisor,
  selectAdvisorHierarchyState,
} from '../model/selectors';
import {
  closeSession,
  fetchClientsForAdvisorByAdvisorIdRequest,
  DeleteClientDialog,
  LinkClientPartnerDialog,
  SendResultsLinkModal,
  ClientDataModal,
  updateClientsSearchText,
} from '..';
import manAtComputerImageUrl from '../images/advisorDashboardManAtComputer.png';

import SplitButtonDropDown from './SplitButtonDropDown';
import { DataTable } from './DataTable';
import { createClientTableColumns } from './ClientsTable';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { ColumnDef } from '@tanstack/react-table';
import { Link2, Mails } from 'lucide-react';
import { Send } from 'lucide-react';

type AdvisorDashboardClientsProps = {
  show: boolean;
  advisorSideBarMobileButton: React.ReactNode;
  setShowInviteClientModal: (open: boolean) => void;
  setShowIntakeFormLinkModal: (open: boolean) => void;
  setShowBatchInviteModal: (open: boolean) => void;
};

type ModalType =
  | 'delete'
  | 'linkPartner'
  | 'sendMagicLink'
  | 'clientData'
  | null;
export interface ModalState {
  type: ModalType;
  client?: Client; // Could be typed more specifically based on your needs
}

export function AdvisorDashboardClients({
  show,
  advisorSideBarMobileButton,
  setShowInviteClientModal,
  setShowIntakeFormLinkModal,
  setShowBatchInviteModal,
}: AdvisorDashboardClientsProps) {
  const dispatch = useDispatch();
  const advisor = useSelector(selectSessionAdvisor);
  const { advisorFirstName } = advisor;
  const cognitoUser = useSelector(selectMaybeSessionCognitoUser);
  const navigate = useNavigate();
  const clients = useSelector(selectClients);
  const clientsIsLoading = useSelector(selectClientsIsLoading);
  const hasClients = clients.length > 0;
  const { subordinateAdvisors } = useSelector(selectAdvisorHierarchyState);

  const [searchText, setSearchText] = useState(
    useSelector(selectClientsSearchText),
  );

  const handleSearchTextChange = (searchText: string) => {
    setSearchText(searchText);
    dispatch(updateClientsSearchText(searchText));
  };

  const handleClickRefresh = useCallback(
    function handleClickRefreshImpl() {
      dispatch(
        fetchClientsForAdvisorByAdvisorIdRequest({
          advisorId: advisor.advisorId,
          isInvalidation: false,
        }),
      );
    },
    [advisor.advisorId, dispatch],
  );
  const [modalState, setModalState] = useState<ModalState>({ type: null });
  const onCloseModal = () => setModalState({ type: null });

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

  const noClientsBodyContent = (
    <>
      <div className="flex h-full flex-col items-center justify-center xl:flex-row xl:gap-20">
        <div className="">
          <img
            className="max-w-[350px] md:max-w-[600px]"
            src={manAtComputerImageUrl}
            alt="man at computer"
          />
        </div>
        <div className="flex flex-col items-center gap-7 xl:mt-0 xl:justify-center">
          <div className="">
            <span className="text-4xl text-darkPurple">{`Welcome, ${advisorFirstName}!`}</span>
          </div>
          <SplitButtonDropDown
            buttonLabel="Invite your first client"
            dropDownItems={[
              {
                name: 'Send email invite',
                onClick: () => setShowInviteClientModal(true),
                startIcon: <BsFillSendPlusFill className="h-4 w-4" />,
              },
              {
                name: 'Intake form link',
                onClick: () => setShowIntakeFormLinkModal(true),
                startIcon: <Link2 className="h-4 w-4" />,
              },
            ]}
            onClick={() => setShowInviteClientModal(true)}
            startIcon={<BsSendPlus className="h-5 w-5" />}
            className="w-68 my-1 h-16 flex-grow justify-center text-xl"
            primaryCta={true}
          />
          <div className="flex items-center justify-center gap-1 pb-8 text-base text-gray-700">
            <p className="">Not seeing your client?</p>
            <button
              onClick={handleClickRefresh}
              className="flex items-center gap-2 font-semibold text-gray-700"
            >
              Click here to refresh
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // Memoize the columns creation since it depends on clients and setModalState
  const memoizedColumns = useMemo(
    () =>
      createClientTableColumns({
        data: clients,
        setModalState,
        sessionAdvisor: advisor,
      }),
    [clients, setModalState, advisor],
  );

  // Memoize the refresh handler
  const memoizedHandleRefresh = useCallback(
    function handleClickRefreshImpl() {
      dispatch(
        fetchClientsForAdvisorByAdvisorIdRequest({
          advisorId: advisor.advisorId,
          isInvalidation: false,
        }),
      );
    },
    [advisor.advisorId, dispatch],
  );

  // Memoize the entire DataTable instance
  const memoizedDataTable = useMemo(
    () => (
      <DataTable<Client>
        columns={memoizedColumns as ColumnDef<Client>[]}
        getRowId={row => row.clientId}
        data={clients}
        isLoading={clientsIsLoading}
        primarySearchText={searchText ?? undefined}
        primarySearchFieldKey="clientName"
        handleRefresh={memoizedHandleRefresh}
        className="mb-12"
        tableId="clientsTable"
        // TODO: this is not working as expected, need to fix. The initial visibility is being overridden by the saved state, which is always false for organization.
        initialColumnVisibility={{
          organization: subordinateAdvisors.length > 0,
        }}
        tableSkeletonRows={10}
      />
    ),
    [
      memoizedColumns,
      clients,
      clientsIsLoading,
      searchText,
      memoizedHandleRefresh,
      subordinateAdvisors,
    ],
  );

  if (!show) {
    return null;
  }

  return (
    <div className="lg:pl-72">
      {/*  Header - search bar and invite client CTA */}
      <div className="sticky top-0 z-40 flex shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 py-1 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        {advisorSideBarMobileButton}

        <div className="flex w-full gap-4">
          <div className="relative w-full ">
            <label
              htmlFor="search-field"
              className="sr-only"
            >
              Search
            </label>
            <MagnifyingGlassIcon
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
            />
            <input
              id="search-field"
              name="search"
              type="search"
              value={searchText}
              disabled={clientsIsLoading || clients.length === 0}
              onChange={e => handleSearchTextChange(e.target.value)}
              placeholder="Search client name..."
              className="block h-full w-full border-0 bg-white py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 sm:text-sm"
            />
          </div>
          <SplitButtonDropDown
            buttonLabel="Invite Client"
            dropDownItems={[
              {
                name: 'Send email invite',
                onClick: () => setShowInviteClientModal(true),
                startIcon: <Send className="h-4 w-4" />,
              },
              {
                name: 'Intake form link',
                onClick: () => setShowIntakeFormLinkModal(true),
                startIcon: <Link2 className="h-4 w-4" />,
              },
              {
                name: 'Bulk invite',
                onClick: () => setShowBatchInviteModal(true),
                startIcon: <Mails className="h-4 w-4" />,
              },
            ]}
            onClick={() => setShowInviteClientModal(true)}
            startIcon={<Send />}
            className="my-1 h-12 w-60 flex-grow justify-center"
            primaryCta={true}
          />
        </div>
      </div>

      {/* Clients table */}
      <main className="px-4 pt-3 sm:px-6 lg:px-8">
        {hasClients || clientsIsLoading
          ? memoizedDataTable
          : noClientsBodyContent}
      </main>
      {modalState.client && (
        <>
          <DeleteClientDialog
            client={modalState.client}
            open={modalState.type === 'delete'}
            onClose={onCloseModal}
          />
          <LinkClientPartnerDialog
            client={modalState.client}
            open={modalState.type === 'linkPartner'}
            onClose={onCloseModal}
          />
          <SendResultsLinkModal
            client={modalState.client}
            open={modalState.type === 'sendMagicLink'}
            onClose={onCloseModal}
          />
          <ClientDataModal
            partialClient={modalState.client}
            open={modalState.type === 'clientData'}
            onClose={onCloseModal}
          />
        </>
      )}
    </div>
  );
}
