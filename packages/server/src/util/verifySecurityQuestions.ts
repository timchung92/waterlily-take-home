import {
  ExError,
  SecurityVerificationService,
  VerificationResult,
  isNullOrUndefined,
  logDebug,
  surveyDefinitions,
} from '@shared';
import { fetchClientByClientId } from '../services/fetchClientByClientId';

interface SecurityQuestionAnswers {
  dateOfBirth: string;
  zipCode: string;
  height: string;
}

export async function verifySecurityQuestions(
  clientId: string,
  answers: SecurityQuestionAnswers,
): Promise<VerificationResult> {
  if (isNullOrUndefined(clientId)) {
    throw new ExError('Must provide clientId', {});
  }

  const clientResponse = await fetchClientByClientId(clientId);

  const intakeSurvey = clientResponse.client.surveys.find(
    s =>
      s.surveyDefinitionId === surveyDefinitions.intakeForm.surveyDefinitionId,
  ) as IntakeSurvey;

  if (isNullOrUndefined(intakeSurvey)) {
    throw new ExError(
      'Invalid verification for security questions. Intake survey not found.',
      {},
    );
  }

  const verificationResult = SecurityVerificationService.verify(answers, {
    clientBirthDate: intakeSurvey.clientBirthDate,
    clientZipCode: intakeSurvey.clientZipCode,
    clientHeightInches: intakeSurvey.clientHeightInches,
  });

  logDebug(
    'verifySecurityQuestions',
    'verification matches',
    verificationResult.matches,
  );

  return verificationResult;
}
