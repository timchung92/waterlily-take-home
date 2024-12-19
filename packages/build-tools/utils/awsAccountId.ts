import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { awsCredentials } from './awsCredentials';

export async function awsAccountId(): Promise<string>;
export async function awsAccountId(credentials: AwsCredentialIdentity): Promise<string>;
export async function awsAccountId(profile: string): Promise<string>;
export async function awsAccountId(credentialsOrProfile?: string | AwsCredentialIdentity): Promise<string> {

  const credentials = typeof credentialsOrProfile === 'string' || credentialsOrProfile === undefined
      ? await awsCredentials(credentialsOrProfile as string, true) // 'as' shouldn't be needed, but type guards failed for some reason
      : credentialsOrProfile;

  const client = new STSClient({ credentials });
  const command = new GetCallerIdentityCommand({});
  const response = await client.send(command);
  return response.Account ?? null;
}
