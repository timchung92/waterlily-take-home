import { FunctionComponent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import {
  assertSameArrays,
  ExError,
  isDefined,
  isNullOrUndefined,
  regexExtractCaptures,
  SessionType,
} from '@shared';
import { SessionLoader } from './components';
import {
  About,
  AdvisorDashboard,
  AuthLogin,
  AuthPasswordChange,
  AuthPasswordReset,
  AuthPasswordResetChange,
  Home,
  OnboardingOurPredictions,
  OnboardingPredictedCareNeeds,
  OnboardingResultsAreIn,
  OnboardingCostFactors,
  OnboardingCarePhasesPhaseOne,
  OnboardingCarePhasesPhaseTwo,
  OnboardingCarePhasesPhaseThree,
  OnboardingCarePhasesSummary,
  OnboardingCareSettingsPhaseOne,
  OnboardingCareSettingsPhaseTwo,
  OnboardingCareSettingsPhaseThree,
  OnboardingFamilyCaregivingPhaseOne,
  OnboardingFamilyCaregivingPhaseTwo,
  OnboardingFamilyCaregivingPhaseThree,
  RedirectHome,
  Specs,
  WizardCitations,
  WizardDataDump,
  WizardTooltips,
  VerifyMagicLink,
  VerifyPartnerLinkRequest,
  EmailPreferences,
  WizardAdvisorHierarchy,
} from './pages';
import {
  fetchClientByClientIdRequest,
  selectAdvisorHierarchyState,
  selectMaybeClient,
  selectSession,
} from './model';
import { AuthMFASetupExisting } from './pages/AuthMFASetupExisting';
import BarLoaderAnimation from './components/BarLoaderAnimation';
import { WizardAdvisorAdminPortal } from './pages/WizardAdvisorAdminPortal';

export type PageFn<TProps extends ObjectMap<string> | {} = {}> =
  FunctionComponent<TProps>;
export type QueryProps = { query: string };

type AppRouteSource = [PageFn, string];

export interface AppRoute {
  pageFn: PageFn;
  path: string;
  paramNames: string[];
  allowedSessionTypes: SessionType[];
}

export const unauthenticatedAppRoutes = (
  [
    [RedirectHome, '/auth/login'], // AuthLogin is no longer used as its own page but is rendered in place of the page when needed
    [AuthPasswordResetChange, '/auth/password-reset-change/:email'],
    [AuthPasswordReset, '/auth/password-reset'],
    [Specs, '/specs'],
    [VerifyMagicLink, '/auth/magic-link/:token'],
    [VerifyPartnerLinkRequest, '/auth/partner-link/:token'],
    [EmailPreferences, '/email/preferences'],
  ] as AppRouteSource[]
).map(([pageFn, path]) => createAppRoute(pageFn, path, []));

export const authenticatedAppRoutes = (
  [
    [About, '/about'],

    [OnboardingResultsAreIn, '/clients/:clientId/onboarding/results-are-in'],
    [OnboardingOurPredictions, '/clients/:clientId/onboarding/our-predictions'],

    [OnboardingCostFactors, '/clients/:clientId/onboarding/cost-factors'],
    [
      OnboardingCarePhasesPhaseOne,
      '/clients/:clientId/onboarding/care-phases-early',
    ],
    [
      OnboardingCarePhasesPhaseTwo,
      '/clients/:clientId/onboarding/care-phases-moderate',
    ],
    [
      OnboardingCarePhasesPhaseThree,
      '/clients/:clientId/onboarding/care-phases-full',
    ],
    [
      OnboardingCareSettingsPhaseOne,
      '/clients/:clientId/onboarding/care-settings-phase-one',
    ],
    [
      OnboardingCareSettingsPhaseTwo,
      '/clients/:clientId/onboarding/care-settings-phase-two',
    ],
    [
      OnboardingCareSettingsPhaseThree,
      '/clients/:clientId/onboarding/care-settings-phase-three',
    ],
    [
      OnboardingFamilyCaregivingPhaseOne,
      '/clients/:clientId/onboarding/family-caregiving-phase-one',
    ],
    [
      OnboardingFamilyCaregivingPhaseTwo,
      '/clients/:clientId/onboarding/family-caregiving-phase-two',
    ],
    [
      OnboardingFamilyCaregivingPhaseThree,
      '/clients/:clientId/onboarding/family-caregiving-phase-three',
    ],
    [
      OnboardingPredictedCareNeeds,
      '/clients/:clientId/onboarding/predicted-care-needs',
    ],
    [
      OnboardingCarePhasesSummary,
      '/clients/:clientId/onboarding/care-phases-summary',
    ],
  ] as AppRouteSource[]
).map(([pageFn, path]) =>
  createAppRoute(pageFn, path, [
    SessionType.advisor,
    SessionType.wizard,
    SessionType.client,
  ]),
);

export const authenticatedAdvisorOnlyAppRoutes = (
  [
    [AuthPasswordChange, '/auth/password-change'],
    [AuthMFASetupExisting, '/auth/mfa-setup'],
    [AdvisorDashboard, '/advisors/:advisorId'],
    [AdvisorDashboard, '/advisors'],

    // [ClientReport, "/clients/:clientId/report"],
  ] as AppRouteSource[]
).map(([pageFn, path]) =>
  createAppRoute(pageFn, path, [SessionType.advisor, SessionType.wizard]),
);

export const wizardAppRoutes = (
  [
    [WizardCitations, '/wizard/citations'],
    [WizardDataDump, '/wizard/data-dump/clients/:clientId'],
    [WizardTooltips, '/wizard/tooltips'],
    [WizardAdvisorHierarchy, '/wizard/advisor-hierarchy'],
    [WizardAdvisorAdminPortal, '/wizard/advisor-admin-portal'],
  ] as AppRouteSource[]
).map(([pageFn, path]) => createAppRoute(pageFn, path, [SessionType.wizard]));

export const appRoutes = [
  ...unauthenticatedAppRoutes,
  ...authenticatedAppRoutes,
  ...wizardAppRoutes,
  ...authenticatedAdvisorOnlyAppRoutes,
  createAppRoute(Home, '/', [SessionType.advisor, SessionType.wizard]),
];

export const apppRoutesByPage = new Map<PageFn, AppRoute>();
rebuildAppRoutesByPage();

export function Router() {
  return (
    <SessionLoader>
      <Routes>
        {appRoutes.map(route => (
          <Route
            key={route.path}
            path={route.path}
            element={<RouteProxy {...route} />}
          />
        ))}
      </Routes>
    </SessionLoader>
  );
}

function RouteProxy(route: AppRoute) {
  const session = useSelector(selectSession);
  const advisorHierarchy = useSelector(selectAdvisorHierarchyState);
  const maybeClient = useSelector(selectMaybeClient);
  const [fetchingClient, setFetchingClient] = useState(false);
  const params = useParams();
  const dispatch = useDispatch();

  const { allowedSessionTypes, pageFn: Component } = route;

  const isAllowedSessionType =
    allowedSessionTypes.length === 0 ||
    allowedSessionTypes.includes(session.sessionType);

  const { clientId } = params;

  const needClientCacheRefresh =
    isAllowedSessionType &&
    isDefined(clientId) &&
    (isNullOrUndefined(maybeClient) ||
      maybeClient.clientId !== clientId ||
      maybeClient.cachedTimestamp === undefined ||
      maybeClient.cachedTimestamp.valueOf() < Date.now() - 2 * 60 * 1000);

  // even if we're refreshing, if we already have data for the same client let's assume it's going
  // to be the same data once refreshed; most likely the case. Unless the client we're
  // requesting is a new client.
  const waitForClientCacheRefresh =
    needClientCacheRefresh && clientId !== maybeClient?.clientId;

  useEffect(() => {
    if (needClientCacheRefresh && !fetchingClient) {
      setFetchingClient(true);
      dispatch(fetchClientByClientIdRequest(clientId));
    }
    if (fetchingClient && !needClientCacheRefresh) {
      setFetchingClient(false);
    }
  }, [
    clientId,
    dispatch,
    fetchingClient,
    needClientCacheRefresh,
    setFetchingClient,
  ]);

  if (!isAllowedSessionType) {
    return <AuthLogin />;
  }

  if (waitForClientCacheRefresh) {
    return (
      <div className="mx-auto my-auto flex h-screen w-screen items-center justify-center">
        <BarLoaderAnimation loading={waitForClientCacheRefresh} />;
      </div>
    );
  }

  // prevent access of client results via direct link for advisors
  const isAdvisorAccessingClientResults =
    session.advisor && session.sessionType === SessionType.advisor && clientId;

  const isClientOwnedByAdvisor =
    maybeClient?.advisorId === session.advisor?.advisorId;

  const hasSubordinateAdvisors =
    advisorHierarchy?.subordinateAdvisors?.length > 0;
  const isClientOwnedBySubordinate =
    hasSubordinateAdvisors &&
    advisorHierarchy.subordinateAdvisors.some(
      subordinate => subordinate.advisorId === maybeClient?.advisorId,
    );

  if (
    isAdvisorAccessingClientResults &&
    !isClientOwnedByAdvisor &&
    !isClientOwnedBySubordinate
  ) {
    return <RedirectHome />;
  }

  return <Component {...params} />;
}

export function pageToUrl(page: PageFn<{}>): string;
export function pageToUrl(
  page: PageFn<{}>,
  targetProps: {} | undefined,
): string;
export function pageToUrl<TProps extends ObjectMap<string>>(
  page: PageFn<TProps>,
  props: TProps,
): string;
export function pageToUrl(
  page: PageFn<any>,
  props: ObjectMap<string> = {} as ObjectMap<string>,
) {
  const route =
    apppRoutesByPage.get(page) ??
    (rebuildAppRoutesByPage() && apppRoutesByPage.get(page));
  if (route === undefined) {
    throw new ExError(
      'A development error occurred; attempted to link to a non-routed page. Add page to the path map in Router.',
      {
        targetPage: page.name,
        props,
        routedPages: Array.from(apppRoutesByPage.entries()).map(
          ([pageKey, { path }]) => ({
            pageKey: pageKey.name,
            path,
          }),
        ),
      },
    );
  }

  assertSameArrays(
    route.paramNames,
    Object.keys(props),
    'A development error occurred; attempted to link to a page with incorrect parameters.',
    {
      props,
      route,
    },
  );

  return route.path.replace(
    /\/:(\w+)/g,
    (_, propName) => `/${props[propName]}`,
  );
}

export function useNavigateToPage() {
  const navigate = useNavigate();
  return navigateToPage;
  function navigateToPage(page: PageFn<{}>): void;
  function navigateToPage<TProps extends ObjectMap<string>>(
    page: PageFn<TProps>,
    props: TProps,
  ): void;
  function navigateToPage(
    page: PageFn,
    props: ObjectMap<string> = {} as ObjectMap<string>,
  ) {
    const url = pageToUrl(page, props);
    navigate(url);
  }
}

function rebuildAppRoutesByPage(): true {
  apppRoutesByPage.clear();
  appRoutes.forEach(route => {
    const { pageFn } = route;
    if (!apppRoutesByPage.has(pageFn)) {
      apppRoutesByPage.set(pageFn, route);
    }
  });
  return true; // allows us to call as part of an expression..
}

function createAppRoute(
  pageFn: PageFn,
  path: string,
  allowedSessionTypes: SessionType[],
) {
  return {
    pageFn,
    path,
    paramNames: regexExtractCaptures(path, /:(\w+)/g) ?? [],
    allowedSessionTypes,
  } as AppRoute;
}
