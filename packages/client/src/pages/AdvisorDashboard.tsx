import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isDefined, isNullOrUndefined } from '@shared';

import {
  selectSessionAdvisor,
  selectSessionPotentialNewAdvisor,
} from '../model/selectors';
import {
  fetchClientsForAdvisorByAdvisorIdRequest,
  fetchSessionForAuthRequest,
  fetchSubordinateAdvisorsByAdvisorIdRequest,
} from '..';

import AdvisorDashboardShell from '../components/AdvisorDashboardShell';

export function AdvisorDashboard({ advisorId }: AdvisorIdProps) {
  const advisor = useSelector(selectSessionAdvisor);
  const potentialNewAdvisor = useSelector(selectSessionPotentialNewAdvisor);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      fetchClientsForAdvisorByAdvisorIdRequest({
        advisorId: advisor.advisorId,
        isInvalidation: false,
      }),
    );
    dispatch(
      fetchSubordinateAdvisorsByAdvisorIdRequest({
        advisorId: advisor.advisorId,
      }),
    );
  }, [dispatch, advisor.advisorId]);

  useEffect(() => {
    if (
      isDefined(potentialNewAdvisor?.organizationName) &&
      isNullOrUndefined(advisor.organizationName)
    ) {
      // HACKY HACKY CRAPPY CODE, DON'T FOLLOW THIS EXAMPLE
      // DELETE AS SOON AS POSSIBLE, WHEN WE HAVE USER MANAGEMENT
      // AND ARE CREATING USERS IN THE APP
      //
      // When a new user gets here the organization may not have been assigned yet and if we have
      // it cached then let's reload the advisor.
      dispatch(fetchSessionForAuthRequest());
    }
  }, [advisor, dispatch, potentialNewAdvisor]);

  return <AdvisorDashboardShell />;
}
