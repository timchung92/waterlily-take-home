import { Draft, produce } from "immer";
import { calcInferenceSetDerivatives } from "./calcInferenceSetDerivatives";
import { calcCarePhaseCostDerivatives } from "./calcCarePhaseCostDerivatives";
import { calcSupportProviderDerivatives } from "./calcSupportProviderDerivatives";
import { calcSurveyDerivatives } from "./calcSurveyDerivatives";
import { fullName } from "./fullName";
import { calcCareEnvironmentsDerivatives } from "./calcCareEnvironmentsDerivatives";
import { cloneDeep } from "lodash";

export function calcClientDerivatives(
  mutableClient: Draft<Client>,
  clientPartner: Client | null
): Draft<Client> {
  return produce(mutableClient, (draftClient) => {
    if (clientPartner) {
      addMutableClientPartner(draftClient, clientPartner);
    }
    runAllClientDerivativeCalculations(draftClient);
  });
}

function runAllClientDerivativeCalculations(
  mutableClient: Draft<Client>
): Draft<Client> {
  calcClientDerivativesImpl(mutableClient);
  return mutableClient;
}

export function calcClientDerivativesImpl(
  mutableClient: Draft<Client>
): Draft<Client> {
  mutableClient.clientFullName = fullName(mutableClient);
  mutableClient.cachedTimestamp = new Date();

  calcSurveyDerivatives(mutableClient); // must be first
  calcCareEnvironmentsDerivatives(mutableClient);
  calcSupportProviderDerivatives(mutableClient);
  calcInferenceSetDerivatives(mutableClient);
  calcCarePhaseCostDerivatives(mutableClient);

  return mutableClient;
}

function addMutableClientPartner(
  mutableClient: Draft<Client>,
  clientPartner: Client
): void {
  const clientPartnerCopy = cloneDeep(clientPartner);
  mutableClient.mutableClientPartner = clientPartnerCopy;
}
