import {
  CloudFormationClient,
  StackStatus,
} from "@aws-sdk/client-cloudformation";
import { cloudFormationDescribeStack } from './cloudFormationDescribeStack';
import { ExError, formatThousands, wait } from '../../shared/src';

export interface CloudFormationStackResult {
  stackStatus: StackStatus;
  reason: string;
  success: boolean;
  timedOut: boolean;
}

export async function cloudFormationWaitForStackCompleteOrFailed(
  client: CloudFormationClient,
  StackName: string,
  timeoutMs: number = 30 * 60 * 1000
): Promise<CloudFormationStackResult> {

  const absoluteTimeout = Date.now() + timeoutMs;
  let lastConsoleUpdate = 0;

  while(true) {
    const status = await cloudFormationDescribeStack(client, StackName);
    switch (status?.StackStatus) {
      case StackStatus.CREATE_COMPLETE:
      case StackStatus.DELETE_COMPLETE:
      case StackStatus.IMPORT_COMPLETE:
      case StackStatus.IMPORT_ROLLBACK_COMPLETE:
      case StackStatus.ROLLBACK_COMPLETE:
      case StackStatus.UPDATE_COMPLETE:
      case StackStatus.UPDATE_ROLLBACK_COMPLETE:
        return {
          stackStatus: status.StackStatus,
          reason: status.StackStatusReason,
          success: true,
          timedOut: false,
        };

      case StackStatus.CREATE_FAILED:
      case StackStatus.DELETE_FAILED:
      case StackStatus.IMPORT_ROLLBACK_FAILED:
      case StackStatus.ROLLBACK_FAILED:
      case StackStatus.UPDATE_FAILED:
      case StackStatus.UPDATE_ROLLBACK_FAILED:
        return {
          stackStatus: status.StackStatus,
          reason: status.StackStatusReason,
          success: false,
          timedOut: false,
        };

      case StackStatus.CREATE_IN_PROGRESS:
      case StackStatus.DELETE_IN_PROGRESS:
      case StackStatus.IMPORT_IN_PROGRESS:
      case StackStatus.IMPORT_ROLLBACK_IN_PROGRESS:
      case StackStatus.REVIEW_IN_PROGRESS:
      case StackStatus.ROLLBACK_IN_PROGRESS:
      case StackStatus.UPDATE_COMPLETE_CLEANUP_IN_PROGRESS:
      case StackStatus.UPDATE_IN_PROGRESS:
      case StackStatus.UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS:
      case StackStatus.UPDATE_ROLLBACK_IN_PROGRESS:
        const maxTimeout = Math.min(absoluteTimeout - Date.now(), 150);
        if (maxTimeout > 0) {
          if (Date.now() > lastConsoleUpdate + 5000) {
            console.log(`    Stack ${ StackName } still ${ status.StackStatus }`);
            lastConsoleUpdate = Date.now();
          }
          await wait(maxTimeout);
        } else {
          return {
            stackStatus: status.StackStatus,
            reason: `Status is still in progress after timeout of ${ formatThousands(timeoutMs) } milliseconds.`,
            success: false,
            timedOut: true,
          };
        }
        break;

      default:
        throw new ExError(
          'CloudFormation DescribeStack returned an unrecognized StackStatus. cloudFormationWaitForStackCompleteOrFailed needs to be updated.',
          {
            status
          }
        );
    }
  }
}
