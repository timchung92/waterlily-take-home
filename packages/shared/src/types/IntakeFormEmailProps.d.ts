declare interface IntakeFormEmailProps {
  email: string;
  clientFirstName?: string;
  advisorFirstName?: string;
  intakeFormLink: string;
  advisorOrganization?: string;
  advisorProvidedBody?: string;
  isTestEmail?: boolean;
}

declare interface BatchIntakeFormEmailProps {
  intakeFormEmailProps: IntakeFormEmailProps[];
}

declare interface BatchEmailResult {
  successCount: number;
  errorCount: number;
  errors: Array<{
    email: string;
    error: string;
  }>;
}
