import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { selectMaybeClient, selectSession } from '../model';
import { SessionType } from '@shared';
import { initializeIntercom, updateIntercomUser } from '../util';

function toUnixTimestamp(dateTime: Date): number {
  return Math.floor(dateTime.getTime() / 1000);
}

export function IntercomUpdate() {
  const { pathname } = useLocation();
  const session = useSelector(selectSession);
  const maybeClient = useSelector(selectMaybeClient);
  const clientAdlCount =
    maybeClient?.intakeSurvey?.clientAdlReceivedAssistanceCount;
  const clientPartOfGroupPlan =
    maybeClient?.intakeSurvey?.customHiddenFields.customGroupPlan === 'true';

  useEffect(() => {
    const advisor = session?.advisor;
    const sessionType = session?.sessionType;
    if (
      advisor &&
      (sessionType === SessionType.advisor ||
        sessionType === SessionType.wizard)
    ) {
      updateIntercomUser(
        {
          name: `${advisor.advisorFirstName} ${advisor.advisorLastName}`,
          email: advisor.advisorEmail,
          createdAt: toUnixTimestamp(advisor.advisorCreatedDateTime),
          userId: advisor.advisorId,
          userHash: session.intercomIdentityHash!,
          clientAdlCount,
          clientPartOfGroupPlan,
        },
        pathname,
      );
    } else if (maybeClient && sessionType === SessionType.client) {
      updateIntercomUser(
        {
          name: `${maybeClient.clientFirstName} ${maybeClient.clientLastName}`,
          email: maybeClient.clientEmail,
          createdAt: toUnixTimestamp(maybeClient.clientAddedDateTime),
          userId: maybeClient.clientId,
          userHash: session.intercomIdentityHash!,
          clientAdlCount,
        },
        pathname,
      );
    }
  }, [pathname, session, maybeClient, clientAdlCount]);

  useEffect(() => {
    initializeIntercom();
  }, []);
  return null;
}

export default IntercomUpdate;
