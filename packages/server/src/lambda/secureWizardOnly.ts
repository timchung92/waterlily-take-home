import {
  ApiExError,
  httpStatusCodes,
  isRunningLocal,
} from '@shared';

export function secureWizardOnly(_props: unknown) {
  if (!isRunningLocal()) {
    throw new ApiExError(
      httpStatusCodes.methodNotAllowed, // see explanation in routeCall
      'Wizard level security not implemented yet, so URL is being restricted to local development only..',
      {}
    );
  }
}
