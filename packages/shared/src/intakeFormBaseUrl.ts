import { builtEnvironment } from '.';

export const INTAKE_BASE_URL: string =
  builtEnvironment === 'prod'
    ? 'https://waterlily.typeform.com/to/JduxOXor#'
    : 'https://waterlily.typeform.com/to/xI53j0sD#';
