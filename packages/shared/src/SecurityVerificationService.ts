import { isNullOrUndefined } from '@shared';

export interface SecurityVerificationFields {
  dateOfBirth: string | Date;
  zipCode: string;
  height: string | number;
}

export interface SecurityVerificationSource {
  clientBirthDate: string | Date;
  clientZipCode: string;
  clientHeightInches: number;
}

export interface VerificationResult {
  isValid: boolean;
  matches: {
    dateOfBirth: boolean;
    zipCode: boolean;
    height: boolean;
  };
  error?: string;
}

export class SecurityVerificationService {
  private static createNotSuppliedErrorMessage(notSupplied: string) {
    return `Invalid verification for security questions. No ${notSupplied} was supplied.`;
  }

  private static convertDateToUtc(date: Date | string): number {
    return new Date(date).setUTCHours(0, 0, 0, 0);
  }

  private static isWithinOne(num: number, target: number): boolean {
    return Math.abs(num - target) <= 1;
  }

  private static parseHeight(height: string | number): number {
    if (typeof height === 'number') return height;

    // If it's a string in the format "5'10"", convert to inches
    const match = height.match(/(\d+)'(\d+)"/);
    if (match) {
      const feet = parseInt(match[1]);
      const inches = parseInt(match[2]);
      return feet * 12 + inches;
    }

    return parseInt(height);
  }

  private static validateFields(
    fields: SecurityVerificationFields,
  ): string | null {
    const requiredFields: (keyof SecurityVerificationFields)[] = [
      'dateOfBirth',
      'zipCode',
      'height',
    ];

    for (const field of requiredFields) {
      if (isNullOrUndefined(fields[field])) {
        return this.createNotSuppliedErrorMessage(field);
      }
    }

    return null;
  }

  static verify(
    inputFields: SecurityVerificationFields,
    sourceData: SecurityVerificationSource,
    options: {
      dateToleranceMs?: number;
      heightToleranceInches?: number;
    } = {},
  ): VerificationResult {
    // Set default options
    const {
      dateToleranceMs = 24 * 60 * 60 * 1000, // One day in milliseconds
    } = options;

    // Validate input fields
    const validationError = this.validateFields(inputFields);
    if (validationError) {
      return {
        isValid: false,
        matches: {
          dateOfBirth: false,
          zipCode: false,
          height: false,
        },
        error: validationError,
      };
    }

    // Convert dates to UTC
    const sourceDateUTC = this.convertDateToUtc(sourceData.clientBirthDate);
    const inputDateUTC = this.convertDateToUtc(inputFields.dateOfBirth);

    // Perform matching
    const matches = {
      dateOfBirth: Math.abs(sourceDateUTC - inputDateUTC) <= dateToleranceMs,
      zipCode: sourceData.clientZipCode === inputFields.zipCode,
      height: this.isWithinOne(
        sourceData.clientHeightInches,
        this.parseHeight(inputFields.height),
      ),
    };

    return {
      isValid: Object.values(matches).every(match => match),
      matches,
    };
  }
}

// Example usage of verification hooks
export function useSecurityVerification() {
  const verify = async (
    fields: SecurityVerificationFields,
    source: SecurityVerificationSource,
    onSuccess?: () => void,
    onFailure?: () => void,
  ) => {
    try {
      const result = SecurityVerificationService.verify(fields, source);

      if (result.isValid) {
        onSuccess?.();
      } else {
        onFailure?.();
      }

      return result;
    } catch (error) {
      return {
        isValid: false,
        matches: {
          dateOfBirth: false,
          zipCode: false,
          height: false,
        },
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  };

  return { verify };
}
