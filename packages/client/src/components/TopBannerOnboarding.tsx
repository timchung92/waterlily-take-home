import { useSelector } from 'react-redux';
import { PageLink } from '../components';
import { selectClient, selectSession, selectSessionAdvisor } from '../model';
import { AdvisorDashboard } from '../pages';
import CompanyLogoContainer from './CompanyLogo';

import { SessionType } from '../../../shared/src/SessionType';
import classNames from 'classnames';
import { ContactAdvisorButton } from './ContactAdvisorButton';
import { useState } from 'react';
import { RequestAdvisorMeetingModal } from './RequestAdvisorMeetingModal';
import { XMarkIcon } from '@heroicons/react/20/solid';

type TopBannerOnboardingProps = {
  className?: string;
};

export function TopBannerOnboarding({ className }: TopBannerOnboardingProps) {
  const client = useSelector(selectClient)!;
  const advisor = useSelector(selectSessionAdvisor);
  const session = useSelector(selectSession);
  const { advisorId } = client;

  const [isRequestMeetingOpen, setIsRequestMeetingOpen] = useState(false);

  return (
    <>
      <div
        className={classNames(
          'relative mb-2 flex flex-col gap-2 md:flex-row md:justify-between md:gap-0',
          className,
        )}
      >
        <div className="inline-block">
          <PageLink
            to={AdvisorDashboard}
            targetProps={{ advisorId }}
          >
            <CompanyLogoContainer advisor={advisor} />
          </PageLink>
        </div>

        {session.sessionType === SessionType.client ? (
          <ContactAdvisorButton
            requestMeetingOnClick={() => setIsRequestMeetingOpen(true)}
            className={'mt-2 '}
          />
        ) : (
          <PageLink
            className="absolute right-0 top-0 rounded-full p-0.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            to={AdvisorDashboard}
            targetProps={{ advisorId }}
          >
            <XMarkIcon className="h-6 w-6 md:h-8 md:w-8" />
          </PageLink>
        )}
      </div>
      <RequestAdvisorMeetingModal
        open={isRequestMeetingOpen}
        onClose={() => setIsRequestMeetingOpen(false)}
      />
    </>
  );
}
