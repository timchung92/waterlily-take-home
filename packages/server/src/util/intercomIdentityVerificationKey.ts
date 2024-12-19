import { fetchParamValue, intercomIdentityVerificationKeyProvided, intercomIdentityVerificationKeySSMName } from "@server/util";

export async function intercomIdentityVerificationKey() {
    return intercomIdentityVerificationKeyProvided || await fetchParamValue(intercomIdentityVerificationKeySSMName);
}
