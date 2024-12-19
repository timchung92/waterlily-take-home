
import { ExError } from './ExError';

export class DidNotConsentExError extends ExError {
  constructor(
    staticMessage: string,
    metadata: ObjectMap<unknown>
  ) {
    super(
      staticMessage,
      metadata
    );
  }
}
