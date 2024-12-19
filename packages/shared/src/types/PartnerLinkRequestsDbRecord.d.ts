declare type PartnerLinkRequestStatus =
  | 'requested'
  | 'accepted'
  | 'locked'
  | 'verification_failed';

declare type PartnerLinkRequestsDbRecord = {
  partnerLinkRequestId: string;
  clientId: string; // client who made the request
  partnerClientId: string; // client who received the request
  advisorId: string;
  token: string;
  status: PartnerLinkRequestStatus;
  unsuccessfulVerificationAttempts: number;
  statusDateTime: Date;
  expirationDateTime: Date;
  createdDateTime: Date;
};
