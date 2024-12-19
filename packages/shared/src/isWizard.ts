export function isWizard(advisor: Advisor) {
  return Boolean(
    advisor?.advisorEmail?.endsWith('@joinwaterlily.com') ||
    advisor?.advisorEmail?.endsWith('@aterlily.com')
  );
}
