import { ChangeEvent, FormEvent, useCallback, useState } from 'react';
import { AuthSubmitButton } from '../components/AuthComponents';
import mainStyles from '../styles/main.module.css';
import moduleStyles from './AuthPasswordChangeForm.module.css';
import { isNullUndefinedOrEmpty } from '@shared';
import { Link } from 'react-router-dom';
import { identity, isBoolean, isEmpty, isString } from 'lodash';
import { isNullOrUndefined } from '@shared';

import {
  AuthInputTextField,
  AuthInputDisabledField,
} from '../components/AuthComponents';

const styles = {
  ...mainStyles,
  ...moduleStyles,
};

export interface AuthPasswordChangeFormPrompts {
  promptForVerificationCode: boolean;
  promptForCurrentPassword: boolean;
  promptForFirstAndLastName: boolean;
}

export interface AuthPasswordChangeFormProps
  extends AuthPasswordChangeFormPrompts {
  advisorEmail?: string; // passing as prop since it could have different sources
  errorMessage?: string;
  onSubmitChangePassword(
    authPasswordChangeFormInputs: AuthPasswordChangeFormInputs,
  ): void;
}

export interface AuthPasswordChangeFormInputs {
  advisorFirstName: string;
  advisorLastName: string;
  organizationName: string;
  organizationDisplayName: string;
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface AuthPasswordChangeFormErrors extends ObjectMap<boolean | undefined> {
  advisorFirstName?: boolean;
  advisorLastName?: boolean;
  organizationName?: boolean;
  organizationDisplayName?: boolean;
  oldPassword?: boolean;
  newPassword?: boolean;
  confirmNewPassword?: boolean;
}

interface AuthPasswordChangePolicyErrors
  extends ObjectMap<boolean | undefined> {
  acceptedPrivacyPolicy?: boolean;
  acceptedNoRealData?: boolean;
}

export function AuthPasswordChangeForm({
  advisorEmail,
  onSubmitChangePassword,
  promptForVerificationCode,
  promptForCurrentPassword,
  promptForFirstAndLastName,
  errorMessage,
}: AuthPasswordChangeFormProps) {
  const [advisorFirstName, setAdvisorFirstName] = useState('');
  const [advisorLastName, setAdvisorLastName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationDisplayName, setOrganizationDisplayName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);
  const [acceptedNoRealData, setAcceptedNoRealData] = useState(false);
  const [formErrors, setFormErrors] = useState(
    {} as AuthPasswordChangeFormErrors,
  );
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [policyErrors, setPolicyErrors] = useState(
    {} as AuthPasswordChangePolicyErrors,
  );

  const handleClickSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const newFormErrors = {} as AuthPasswordChangeFormErrors;
      const newPolicyErrors = {} as AuthPasswordChangePolicyErrors;

      if (newPassword !== confirmNewPassword) {
        newFormErrors.confirmNewPassword = true;
        setFormErrorMessage('Passwords do not match.');
      }

      if (promptForFirstAndLastName) {
        checkForErors({
          advisorFirstName,
          advisorLastName,
          organizationName,
        });
        checkForErors(
          {
            acceptedPrivacyPolicy,
            acceptedNoRealData,
          },
          newPolicyErrors,
        );
      }
      if (promptForCurrentPassword) {
        checkForErors({ oldPassword });
      }

      checkForErors({
        newPassword,
        confirmNewPassword,
      });

      setFormErrors(newFormErrors);
      setPolicyErrors(newPolicyErrors);

      if (!isEmpty(newFormErrors) || !isEmpty(newPolicyErrors)) {
        return;
      }

      onSubmitChangePassword({
        advisorLastName,
        advisorFirstName,
        organizationName,
        organizationDisplayName,
        oldPassword,
        newPassword,
        confirmNewPassword,
      });

      function checkForErors(
        values: ObjectMap<string | boolean>,
        newErrors: ObjectMap<boolean | undefined> = newFormErrors,
      ) {
        const theseErrors = Object.entries(values).filter(([_key, value]) =>
          isString(value)
            ? value === ''
            : isBoolean(value)
              ? value === false
              : isNullOrUndefined(value),
        );

        if (theseErrors.length === 0) {
          return;
        }
        theseErrors.forEach(([key, value]) => (newErrors[key] = true));
      }
    },
    [
      advisorFirstName,
      advisorLastName,
      organizationName,
      organizationDisplayName,
      oldPassword,
      newPassword,
      confirmNewPassword,
      acceptedPrivacyPolicy,
      acceptedNoRealData,
      onSubmitChangePassword,
      setFormErrors,
      setPolicyErrors,
    ],
  );

  const handleChangeAdvisorFirstName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setAdvisorFirstName(event.target.value);
      setFormErrors({
        ...formErrors,
        advisorFirstName: isNullUndefinedOrEmpty(event.target.value),
      });
    },
    [formErrors, setAdvisorFirstName, setFormErrors],
  );

  const handleChangeAdvisorLastName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setAdvisorLastName(event.target.value);
      setFormErrors({
        ...formErrors,
        advisorLastName: isNullUndefinedOrEmpty(event.target.value),
      });
    },
    [formErrors, setAdvisorLastName, setFormErrors],
  );

  const handleChangeOrganizationName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setOrganizationName(event.target.value);
      setFormErrors({
        ...formErrors,
        organizationName: isNullUndefinedOrEmpty(event.target.value),
      });
    },
    [formErrors, setOrganizationName, setFormErrors],
  );

  const handleChangeOrganizationDisplayName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setOrganizationDisplayName(event.target.value);
    },
    [setOrganizationDisplayName],
  );

  const handleChangeOldPassword = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setOldPassword(event.target.value);
      setFormErrors({
        ...formErrors,
        oldPassword: isNullUndefinedOrEmpty(event.target.value),
      });
    },
    [formErrors, setFormErrors, setOldPassword],
  );

  const handleChangeNewPassword = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setNewPassword(event.target.value);
      setFormErrors({
        ...formErrors,
        newPassword: isNullUndefinedOrEmpty(event.target.value),
      });
    },
    [formErrors, setFormErrors, setNewPassword],
  );

  const handleChangeConfirmNewPassword = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setConfirmNewPassword(event.target.value);
      setFormErrors({
        ...formErrors,
        confirmNewPassword: isNullUndefinedOrEmpty(event.target.value),
      });
    },
    [formErrors, setConfirmNewPassword, setFormErrors],
  );

  const handleChangeAcceptedPrivacyPolicy = useCallback(
    (event: any) => {
      const { checked } = event.target as HTMLInputElement;
      setAcceptedPrivacyPolicy(checked);
      setPolicyErrors({
        ...policyErrors,
        acceptedPrivacyPolicy: !checked,
      });
    },
    [policyErrors, setAcceptedPrivacyPolicy, setPolicyErrors],
  );

  const handleCangeAcceptedNoRealData = useCallback(
    (event: any) => {
      const { checked } = event.target as HTMLInputElement;
      setAcceptedNoRealData(checked);
      setPolicyErrors({
        ...policyErrors,
        acceptedNoRealData: !checked,
      });
    },
    [policyErrors, setAcceptedNoRealData, setPolicyErrors],
  );

  return (
    <form onSubmit={handleClickSubmit}>
      {Object.values(formErrors).some(identity) ? (
        <div className={styles.errorText}>Please correct errors:</div>
      ) : null}
      {errorMessage ? (
        <div className={styles.errorText}>{errorMessage}</div>
      ) : null}
      {formErrorMessage ? (
        <div className={styles.errorText}>{formErrorMessage}</div>
      ) : null}
      {promptForFirstAndLastName ? (
        <>
          <AuthInputDisabledField
            label="Email"
            id="email"
            autoComplete="email"
            value={advisorEmail}
          />
          <AuthInputTextField
            label="First Name"
            id="firstname"
            placeholder="First Name"
            value={advisorFirstName}
            onChange={handleChangeAdvisorFirstName}
            error={formErrors.advisorFirstName}
            autoComplete="given-name"
          />
          <AuthInputTextField
            label="Last Name"
            id="lastname"
            placeholder="Last Name"
            value={advisorLastName}
            onChange={handleChangeAdvisorLastName}
            error={formErrors.advisorLastName}
            autoComplete="family-name"
          />
          <AuthInputTextField
            label="Organization legal name (for consent)"
            id="organization"
            placeholder="Organization legal name"
            value={organizationName}
            error={formErrors.organizationName}
            onChange={handleChangeOrganizationName}
            autoComplete="organization"
          />
          <AuthInputTextField
            label="Organization display name (for whitelabel)"
            id="organization-display"
            placeholder="Organization display name"
            value={organizationDisplayName}
            error={formErrors.organizationDisplayName}
            onChange={handleChangeOrganizationDisplayName}
            autoComplete="organization"
          />
        </>
      ) : null}
      {promptForCurrentPassword ? (
        <>
          <AuthInputTextField
            label="Current password"
            id="oldpassword"
            type="password"
            placeholder="Current Password"
            value={oldPassword}
            error={formErrors.oldPassword}
            onChange={handleChangeOldPassword}
            autoComplete="current-password"
          />
        </>
      ) : null}
      <AuthInputTextField
        label="New password"
        id="newpassword"
        type="password"
        autoComplete="new-password"
        placeholder="New password"
        value={newPassword}
        error={formErrors.newPassword}
        onChange={handleChangeNewPassword}
      />
      <AuthInputTextField
        label="Confirm new password"
        id="confirmpassword"
        type="password"
        autoComplete="new-password"
        placeholder="Confirm new password"
        value={confirmNewPassword}
        error={formErrors.confirmNewPassword}
        onChange={handleChangeConfirmNewPassword}
      />
      <div className="mt-5">
        <AuthSubmitButton title="Submit" />
      </div>

      <p></p>
      {promptForFirstAndLastName ? (
        <div className="pb-16 pt-6">
          {Object.values(policyErrors).some(identity) ? (
            <div className={styles.errorText + ' ' + styles.acceptError}>
              Click the checkboxes to accept our privacy policy and beta data
              terms.
            </div>
          ) : null}
          <p className="mt-2 flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              id="termsAndPrivacy"
              className="h-4 w-4"
              onChange={handleChangeAcceptedPrivacyPolicy}
              onClick={handleChangeAcceptedPrivacyPolicy}
              defaultChecked={false}
            />
            <label
              className={styles.checkBoxDescriptors}
              htmlFor="termsAndPrivacy"
            >
              {' '}
              by clicking here, you agree to our{' '}
            </label>
            <Link
              to="https://www.joinwaterlily.com/terms-of-service"
              target="_blank"
              className={styles.checkBoxDescriptors}
            >
              Terms of Service
            </Link>
            <label
              className={styles.checkBoxDescriptors}
              htmlFor="termsAndPrivacy"
            >
              {' '}
              and{' '}
            </label>
            <Link
              to="https://www.joinwaterlily.com/privacy-policy"
              target="_blank"
              className={styles.checkBoxDescriptors}
            >
              Privacy Policy.
            </Link>
          </p>
          <p className="mt-2 flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              id="recognizeBeta"
              name="recognizeBeta"
              defaultChecked={false}
              className="h-4 w-4"
              onChange={handleCangeAcceptedNoRealData}
              onClick={handleCangeAcceptedNoRealData}
            />
            <label
              className={styles.checkBoxDescriptors}
              htmlFor="recognizeBeta"
            >
              {' '}
              by clicking here you agree to our{' '}
            </label>
            <Link
              to="https://www.joinwaterlily.com/pilot-agreement"
              target="_blank"
              className={styles.checkBoxDescriptors}
            >
              Pilot Agreement.
            </Link>
          </p>
        </div>
      ) : null}
    </form>
  );
}
