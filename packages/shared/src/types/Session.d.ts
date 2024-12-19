declare interface Session {
  sessionType: SessionType;
  advisor: Advisor | null;
  potentialNewAdvisor: AdvisorExistsResult | null;
  cognitoSession: PlainCognitoUserSession | null;
  isLoading: boolean = false;
  intercomIdentityHash: string | null;
}
