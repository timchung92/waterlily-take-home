export enum BuildEnvironment {
  local = 'local',
  dev = 'dev',
  demo = 'demo',
  stage = 'stage',
  prod = 'prod',
  custom = 'custom',
}

/**
 * The environment that was targeted when this build was made. In rare cases could differ from
 * the deployed environment (like testing production build issues locally);
 *
 * The value is populated with Regex replace during build.
 */
export const builtEnvironment: BuildEnvironment = BuildEnvironment.local;
