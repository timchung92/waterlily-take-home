import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { selectSession } from '..';
import { calculateFeatureFlags } from '../util';

export function FeatureFlagManager() {
  const session = useSelector(selectSession);
  const dispatch = useDispatch();

  useEffect(() => {
    if (session) {
      calculateFeatureFlags(session.advisor, dispatch);
    }
  }, [session, dispatch]);

  return null; // This component is purely for managing feature flags
}
