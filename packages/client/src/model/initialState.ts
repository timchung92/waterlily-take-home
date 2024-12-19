import type { Action, PayloadAction } from '@reduxjs/toolkit';
import { SessionType } from '@shared';
import { TableStateMap } from './dataTableModel';

export const initialState = {
  activeApiActions: [] as (Action<string> | PayloadAction<unknown>)[],
  advisor: {
    data: null as Advisor | null,
    advisorUpdates: {
      sendMagicLink: null as UpdateStatus | 'unsubscribed',
    },
    advisorSettings: {
      isLoading: false,
      status: null as 'complete' | 'error' | null,
    },
    isLoading: false,
  },
  client: {
    data: null as Client | null,
    clientPartner: null as Client | null,
    isInvalidating: false,
    isLoading: false,
    errorMessage: null as string | null,
    clientUpdates: {
      ltcAtAge: null as UpdateStatus,
      phaseDurations: null as UpdateStatus,
      advisorMeetingRequest: null as UpdateStatus,
      partnerLinkRequest: null as UpdateStatus,
    },
  },
  clients: { data: [] as Client[], isLoading: false, isInvalidating: false },
  clientsSearchText: '',
  logTracker: {
    history: [] as string[],
  },
  session: {
    sessionType: SessionType.unknown,
    advisor: null,
    potentialNewAdvisor: null,
    cognitoSession: null,
    isLoading: false,
  } as Session,
  magicLinkSessionByToken: {
    status: null as null | MagicLinkStatus,
  } as MagicLink,
  intakeFormEmail: {
    status: null as
      | UpdateStatus
      | 'sending test email'
      | 'complete test email'
      | 'complete with errors',
    errorMessage: null as string | null,
    partialSuccessMessage: null as string | null,
    failedEmails: [] as string[],
  },
  policyOptionsRequestEmail: { isLoading: false },
  onboardingSlideTracker: {
    currentSlideIndex: 0,
    previousSlideIndex: 0,
    slideHistory: [] as number[],
  },
  emailPreferences: {
    email: '',
    optOutReminders: false,
    optOutTransactions: false,
    isLoading: false,
    error: null as string | null,
  },
  featureFlags: {
    flags: {
      vbShop: false,
      transamerica: false,
      fortifiedLife: false,
      newYorkLife: false,
      ltciPartners: false,
    },
  },
  policyExtractor: {
    status: null,
    errors: [],
    requestId: '',
    requestedRuns: 0,
    currentRunPollCount: 0,
    fileUrl: '',
    fileBucket: '',
    fileKey: '',
    runsCompletedOrFailed: 0,
    policyType: null,
    responses: [],
    parsedResponses: [],
    processedResponse: null,
  } as PolicyExtractorState,
  dataTable: {} as TableStateMap,
  verifyPartnerLinkRequest: {
    status: null as
      | null
      | 'verified'
      | 'error'
      | 'loading'
      | 'failedToVerify'
      | 'invalidToken'
      | 'locked'
      | 'expired',
    errorMessage: null as string | null,
    dbRecord: null as PartnerLinkRequestsDbRecord | null,
  },
  advisorHierarchy: {
    subordinateAdvisors: [] as Advisor[],
    status: null as
      | 'loading'
      | 'successfullyAddedRelationship'
      | 'successfullyDeletedRelationship'
      | 'error'
      | null,
    errorMessage: null as string | null,
  },
  advisorAdminPortal: {
    status: null as null | 'loading' | 'success' | 'error',
    errorMessage: null as string | null,
    successMessage: null as string | null,
  },
};
