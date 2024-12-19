import { useSelector } from 'react-redux';
import { selectSessionAdvisor } from '..';

export function organizationDisplayNameIncludes(
  sessionAdvisor: Advisor | null,
  includeString: string,
): boolean {
  const organizationDisplayName = sessionAdvisor?.organizationDisplayName;
  if (!organizationDisplayName) {
    return false;
  }
  return organizationDisplayName?.toLocaleLowerCase().includes(includeString);
}
