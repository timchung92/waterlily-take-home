export type CoupleLtcStartData = {
  clientStartsLtcFirst: boolean; // true if client starts LTC first, false if partner starts first
  coupleLtcStartYear: number; // the minimum of the two ltc start years
  getPolicyHolderAgeAtPolicyActivation: (
    isPrimaryPolicyHolder: boolean | undefined,
  ) => number;
};

export function getCoupleLtcStartData(
  client: Client,
  clientPartner: Client | null,
): CoupleLtcStartData | null {
  if (!clientPartner) {
    return null;
  }
  const clientLtcStartYear = client.appliedInferenceSet.ltcAtYear;
  const partnerLtcStartYear = clientPartner.appliedInferenceSet.ltcAtYear;
  const clientStartsLtcFirst = clientLtcStartYear <= partnerLtcStartYear;
  const coupleLtcStartYear = Math.min(clientLtcStartYear, partnerLtcStartYear);
  const clientAgeAtCoupleStartYear =
    coupleLtcStartYear - client.intakeSurvey.clientBirthYear;
  const partnerAgeAtCoupleStartYear =
    coupleLtcStartYear - clientPartner.intakeSurvey.clientBirthYear;

  const getPolicyHolderAgeAtPolicyActivation = (
    isPrimaryPolicyHolder: boolean | undefined,
  ) => {
    if (isPrimaryPolicyHolder && clientStartsLtcFirst) {
      return client.appliedInferenceSet.ltcAtAge;
    } else if (isPrimaryPolicyHolder && !clientStartsLtcFirst) {
      return clientAgeAtCoupleStartYear;
    } else if (!isPrimaryPolicyHolder && clientStartsLtcFirst) {
      return partnerAgeAtCoupleStartYear;
    } else {
      // (!isPrimaryPolicyHolder && !clientStartsLtcFirst)
      return clientPartner.appliedInferenceSet.ltcAtAge;
    }
  };

  return {
    clientStartsLtcFirst,
    coupleLtcStartYear,
    getPolicyHolderAgeAtPolicyActivation,
  };
}
