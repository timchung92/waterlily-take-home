import { exists } from '@server/datastore';
import { appModel } from '@shared';

// We need to call this when a new user requires force password change,
// so must be public. Need to find a better solution.
export async function fetchAdvisorExistsByAdvisorEmailForPublic({ advisorEmail }: AdvisorEmailProps) {
  return {
    advisorEmail,
    advisorExists: await exists(appModel.tableNames.advisors, { advisorEmail }),
  } as AdvisorExistsResult;
}
