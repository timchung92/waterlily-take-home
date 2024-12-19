import { configureStore, isPlain } from '@reduxjs/toolkit';
import { activeApiActionsReducer } from './activeApiActionsModel';
import { advisorReducer } from './advisorModel';
import { apiMiddleware } from './apiMiddleware';
import { clientReducer, invalidateClientsMiddleWare } from './clientModel';
import { clientsReducer } from './clientsModel';
import { clientsSearchTextReducer } from './clientsSearchTextModel';
import { initialState } from './initialState';
import { logTrackerReducer } from './logTrackerModel';
import {
  sessionReducer,
  organizationSaverMiddleware,
  invalidateSessionMiddleWare,
} from './sessionModel';
import { magicLinkSessionByTokenReducer } from './magicLinkModel';
import { intakeFormEmailSliceReducer } from './intakeFormEmailModel';
import { onboardingSlideTrackerReducer } from './onboardingSlideTrackerModel';
import { policyOptionsRequestEmailReducer } from './policyOptionsRequestEmailModel';
import { emailPreferencesReducer } from './emailPreferencesModel';
import { featureFlagsReducer } from './featureFlagsModel';
import { dataTableReducer } from './dataTableModel';
import { verifyPartnerLinkRequestReducer } from './verifyPartnerLinkRequestModel';
import { advisorHierarchyReducer } from './advisorHierarchyModel';
import { advisorAdminPortalReducer } from './advisorAdminPortalModel';

const defaultMiddlewareOptions = {
  serializableCheck: {
    isSerializable(value: unknown) {
      return value instanceof Date || value instanceof Error || isPlain(value);
    },
  },
};

export const store = configureStore({
  reducer: {
    activeApiActions: activeApiActionsReducer,
    advisor: advisorReducer,
    client: clientReducer,
    clients: clientsReducer,
    clientsSearchText: clientsSearchTextReducer,
    logTracker: logTrackerReducer,
    session: sessionReducer,
    magicLinkSessionByToken: magicLinkSessionByTokenReducer,
    intakeFormEmail: intakeFormEmailSliceReducer,
    onboardingSlideTracker: onboardingSlideTrackerReducer,
    policyOptionsRequestEmail: policyOptionsRequestEmailReducer,
    emailPreferences: emailPreferencesReducer,
    featureFlags: featureFlagsReducer,
    dataTable: dataTableReducer,
    verifyPartnerLinkRequest: verifyPartnerLinkRequestReducer,
    advisorHierarchy: advisorHierarchyReducer,
    advisorAdminPortal: advisorAdminPortalReducer,
  },
  middleware(getDefaultMiddleware) {
    return [
      apiMiddleware,
      organizationSaverMiddleware,
      invalidateClientsMiddleWare,
      invalidateSessionMiddleWare,
    ].concat(getDefaultMiddleware(defaultMiddlewareOptions));
  },
});

export type AppState = typeof initialState;
