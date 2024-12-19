import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fullName, isNullUndefinedOrEmpty, logAudit } from '@shared';
import { useNavigate } from 'react-router-dom';
import {
  selectMaybeSessionCognitoUser,
  selectSessionAdvisor,
} from '../model/selectors';
import { closeSession, Modal } from '..';

import { SendClientIntakeModal } from './SendClientInviteModal';
import { IntakeFormLinkModalContent } from './IntakeFormLinkModalContent';
import {
  AdvisorDashboardSideBar,
  AdvisorDashboardSideBarContent,
  AdvisorDashboardSideBarMobile,
} from './AdvisorDashboardSideBar';
import { AdvisorDashboardClients } from './AdvisorDashboardClients';
import { AdvisorDashboardSettings } from './AdvisorDashboardSettings';
import { Bars3Icon } from '@heroicons/react/20/solid';
import { IoArrowBackOutline } from 'react-icons/io5';
import { BatchInviteModal } from './BatchInviteModal';

export type DashboardActivePage = 'clients' | 'settings';

export default function AdvisorDashboardShell() {
  const advisor = useSelector(selectSessionAdvisor);
  const { organizationName } = advisor;
  const dispatch = useDispatch();
  const cognitoUser = useSelector(selectMaybeSessionCognitoUser);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showInviteClientModal, setShowInviteClientModal] = useState(false);
  const [showIntakeFormLinkModal, setShowIntakeFormLinkModal] = useState(false);
  const [showBatchInviteModal, setShowBatchInviteModal] = useState(false);
  const [activePage, setActivePage] = useState<DashboardActivePage>('clients');

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

  const renderAdvisorSideBarMobile = () => (
    <AdvisorDashboardSideBarMobile
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      {renderAdvisorSideBarContent()}
    </AdvisorDashboardSideBarMobile>
  );

  const renderAdvisorSideBarContent = () => (
    <AdvisorDashboardSideBarContent
      activePage={activePage}
      setActivePage={setActivePage}
      setShowIntakeFormLinkModal={setShowIntakeFormLinkModal}
      setShowInviteClientModal={setShowInviteClientModal}
      setShowBatchInviteModal={setShowBatchInviteModal}
      handleClickSignOut={handleClickSignOut}
    />
  );

  const renderSideBarMobileButton = () => (
    <button
      type="button"
      className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
      onClick={() => setSidebarOpen(true)}
    >
      <span className="sr-only">Open sidebar</span>
      <Bars3Icon
        className="h-6 w-6"
        aria-hidden="true"
      />
    </button>
  );

  const renderToClientsBackButton = () => (
    <button
      type="button"
      className="-m-2.5 rounded-full p-2.5 text-sm font-semibold leading-6 text-gray-700 shadow-md ring-1 ring-gray-50 hover:text-gray-900 hover:ring-gray-100 "
      onClick={() => setActivePage('clients')}
    >
      <IoArrowBackOutline className="h-5 w-5" />
    </button>
  );

  return (
    <div className="h-screen ">
      <AdvisorDashboardSideBar
        advisorSideBarMobile={renderAdvisorSideBarMobile()}
        advisorSideBarContent={renderAdvisorSideBarContent()}
      />

      <AdvisorDashboardSettings
        show={activePage === 'settings'}
        advisorSideBarMobileButton={renderSideBarMobileButton()}
        advisorSideBarMobile={renderAdvisorSideBarMobile()}
        backToClientsButton={renderToClientsBackButton()}
      />

      <AdvisorDashboardClients
        show={activePage === 'clients'}
        advisorSideBarMobileButton={renderSideBarMobileButton()}
        setShowIntakeFormLinkModal={setShowIntakeFormLinkModal}
        setShowInviteClientModal={setShowInviteClientModal}
        setShowBatchInviteModal={setShowBatchInviteModal}
      />

      <SendClientIntakeModal
        open={showInviteClientModal}
        onClose={() => setShowInviteClientModal(false)}
        advisor={advisor}
        organizationName={organizationName}
      />
      <BatchInviteModal
        advisor={advisor}
        open={showBatchInviteModal}
        onClose={() => setShowBatchInviteModal(false)}
      />
      <Modal
        open={showIntakeFormLinkModal}
        onClose={() => setShowIntakeFormLinkModal(false)}
        title="Intake form link"
        subTitle="Share this link with your clients via email campaign or on your website."
        width="md"
      >
        <IntakeFormLinkModalContent
          advisor={advisor}
          className="my-8"
        />
      </Modal>
    </div>
  );
}
