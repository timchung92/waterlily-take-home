import React from 'react';
import { Autocomplete } from '@mui/material';
import { CustomizedTextInput } from '@shared';

export interface SecurityVerificationFormValues {
  dateOfBirth: string;
  zipCode: string;
  height: {
    label: string;
    value: string;
  } | null;
}

interface SecurityVerificationErrors {
  dateOfBirth: string;
  zipCode: string;
  height: string;
}

interface SecurityVerificationFormProps {
  onSubmit: (values: SecurityVerificationFormValues) => void;
  isLoading?: boolean;
  className?: string;
  submitButtonText?: string;
  loadingButtonText?: string;
  customStyles?: {
    textbox?: string;
    textboxError?: string;
    errorText?: string;
  };
}

export const SecurityVerificationForm: React.FC<
  SecurityVerificationFormProps
> = ({
  onSubmit,
  isLoading = false,
  className = '',
  submitButtonText = 'Verify',
  loadingButtonText = 'Verifying...',
  customStyles = {},
}) => {
  const [values, setValues] = React.useState<SecurityVerificationFormValues>({
    dateOfBirth: '',
    zipCode: '',
    height: null,
  });

  const [errors, setErrors] = React.useState<SecurityVerificationErrors>({
    dateOfBirth: '',
    zipCode: '',
    height: '',
  });

  const validateFields = (): boolean => {
    const newErrors: SecurityVerificationErrors = {
      dateOfBirth: '',
      zipCode: '',
      height: '',
    };
    let hasError = false;

    if (!values.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
      hasError = true;
    }

    if (!values.zipCode) {
      newErrors.zipCode = 'Zip code is required';
      hasError = true;
    }

    if (!values.height) {
      newErrors.height = 'Height is required';
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    if (validateFields()) {
      onSubmit(values);
    }
  };

  const handleChange = (
    field: keyof SecurityVerificationFormValues,
    value: any,
  ) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof SecurityVerificationErrors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={className}
    >
      <div className="space-y-1">
        {/* Date of Birth Field */}
        <div>
          {errors.dateOfBirth && (
            <div className={customStyles.errorText || 'text-sm text-red-500'}>
              {errors.dateOfBirth}
            </div>
          )}
          <div className="inline-flex py-1">
            <p className="text-sm text-gray-600 md:text-base">
              What is your date of birth?*
            </p>
          </div>
          <CustomizedTextInput
            id="DateOfBirth"
            placeholder="Enter your date of birth"
            variant="outlined"
            fullWidth
            type="date"
            value={values.dateOfBirth}
            error={!!errors.dateOfBirth}
            onChange={e => handleChange('dateOfBirth', e.target.value)}
            required
            InputProps={{
              classes: {
                error: customStyles.textboxError,
                root: customStyles.textbox,
              },
              inputProps: {
                'data-private': 'true',
              },
            }}
          />
        </div>

        {/* Zip Code Field */}
        <div>
          {errors.zipCode && (
            <div className={customStyles.errorText || 'text-sm text-red-500'}>
              {errors.zipCode}
            </div>
          )}
          <div className="py-1">
            <p className="text-sm text-gray-600 md:text-base">
              What zip code do you live in?*
            </p>
          </div>
          <CustomizedTextInput
            id="zipCode"
            placeholder="Enter your zip code"
            variant="outlined"
            fullWidth
            type="text"
            value={values.zipCode}
            error={!!errors.zipCode}
            onChange={e => handleChange('zipCode', e.target.value)}
            required
            InputProps={{
              classes: {
                error: customStyles.textboxError,
                root: customStyles.textbox,
              },
              inputProps: {
                'data-private': 'true',
              },
            }}
          />
        </div>

        {/* Height Field */}
        <div>
          {errors.height && (
            <div className={customStyles.errorText || 'text-sm text-red-500'}>
              {errors.height}
            </div>
          )}
          <div className="py-1">
            <p className="text-sm text-gray-600 md:text-base">
              How tall are you?*
            </p>
          </div>
          <Autocomplete
            id="height"
            fullWidth
            value={values.height}
            options={heightOptions}
            onChange={(_event, value) => handleChange('height', value)}
            renderInput={params => (
              <CustomizedTextInput
                {...params}
                variant="outlined"
                placeholder="Enter your height"
                required
                error={!!errors.height}
                InputProps={{
                  ...params.InputProps,
                  inputProps: {
                    ...params.inputProps,
                    'data-private': 'true',
                  },
                  classes: {
                    error: customStyles.textboxError,
                    root: customStyles.textbox,
                  },
                }}
              />
            )}
          />
        </div>

        <button
          className={`mt-4 w-full rounded-full ${
            isLoading
              ? 'cursor-not-allowed bg-gray-400'
              : 'bg-darkPurple hover:bg-mediumPurple hover:shadow-none'
          } py-2 text-lg text-white shadow-md`}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? loadingButtonText : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export const heightOptions = [
  { label: '4\'10"', value: '4\'10"' },
  { label: '4\'11"', value: '4\'11"' },
  { label: '5\'0"', value: '5\'0"' },
  { label: '5\'1"', value: '5\'1"' },
  { label: '5\'2"', value: '5\'2"' },
  { label: '5\'3"', value: '5\'3"' },
  { label: '5\'4"', value: '5\'4"' },
  { label: '5\'5"', value: '5\'5"' },
  { label: '5\'6"', value: '5\'6"' },
  { label: '5\'7"', value: '5\'7"' },
  { label: '5\'8"', value: '5\'8"' },
  { label: '5\'9"', value: '5\'9"' },
  { label: '5\'10"', value: '5\'10"' },
  { label: '5\'11"', value: '5\'11"' },
  { label: '6\'0"', value: '6\'0"' },
  { label: '6\'1"', value: '6\'1"' },
  { label: '6\'2"', value: '6\'2"' },
  { label: '6\'3"', value: '6\'3"' },
  { label: '6\'4"', value: '6\'4"' },
  { label: '6\'5"', value: '6\'5"' },
  { label: '6\'6"', value: '6\'6"' },
  { label: '6\'7"', value: '6\'7"' },
  { label: '6\'8"', value: '6\'8"' },
  { label: '6\'9"', value: '6\'9"' },
  { label: '6\'10"', value: '6\'10"' },
  { label: '6\'11"', value: '6\'11"' },
  { label: '7\'0"', value: '7\'0"' },
];
