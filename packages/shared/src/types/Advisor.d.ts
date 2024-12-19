declare interface Advisor {
  advisorId: string;
  organizationName?: string;
  organizationDisplayName?: string;
  advisorFirstName: string;
  advisorLastName: string;
  advisorEmail: string;
  advisorCognitoRef: string;
  advisorCreatedDateTime: Date;
  schedulingLinkUrl?: string;
  schedulingLinkDisplayText?: string;
  sendClientResultsLinkSetting?: boolean;
}

declare type AdvisorProfile = Pick<
  Advisor,
  | 'advisorId'
  | 'advisorFirstName'
  | 'advisorLastName'
  | 'advisorEmail'
  | 'organizationName'
  | 'organizationDisplayName'
  | 'schedulingLinkUrl'
  | 'schedulingLinkDisplayText'
  | 'sendClientResultsLinkSetting'
>;
