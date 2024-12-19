import { useSelector } from 'react-redux';
import { selectSession } from '../model/selectors';
import { AdvisorDashboard, useNavigateToPage } from '..';
import { useEffect } from 'react';
import { logRocketIdentifyUser } from '@shared';

export function Home() {
  const session = useSelector(selectSession);
  const navigateToPage = useNavigateToPage();

  useEffect(() => {
    if (session?.advisor?.advisorId) {
      const advisorId = session.advisor.advisorId;
      logRocketIdentifyUser(advisorId, session.advisor.advisorFirstName);
      navigateToPage(AdvisorDashboard, { advisorId });
    }
  }, [session, navigateToPage]);
  return null;
}
