import { builtEnvironment } from '.';

export const INTRO_INTAKE_BASE_URL: string =
  builtEnvironment === 'prod'
    ? 'https://waterlily.typeform.com/to/rnzS67gt#'
    : 'https://waterlily.typeform.com/to/hL2iYrjB#';
