import { fromIni } from '@aws-sdk/credential-providers';
import { AwsCredentialIdentity } from '@aws-sdk/types';

const cachedCredentials: ObjectMap<AwsCredentialIdentity> = {};
const defaultProfileKey = 'default';

export async function awsCredentials(profile?: string, fallbackToDefault: boolean = false) {
  const appliedProfile = profile ?? defaultProfileKey;
  let credentials = cachedCredentials[ appliedProfile ];

  if (credentials) {
    return credentials;
  }

  credentials = await awsCredentialsImpl(appliedProfile);
  if (credentials) {
    cachedCredentials[ appliedProfile ] = credentials;
    return credentials;
  }

  if (profile !== defaultProfileKey && fallbackToDefault) {
    return awsCredentials();
  }

  throw new Error(`Unable to find credentials for '${ appliedProfile }' profile.`);
}

async function awsCredentialsImpl(profile: string) {
  try {
  const credentialsProvider = fromIni({
    profile,
  });
  return await credentialsProvider();
  } catch (err: unknown) {
    if (String(err).includes('could not be found')) {
      return null;
    }
    throw err;
  }
}
