import { ChangeEvent, useCallback, useState } from 'react';
import UserPool from '../util/UserPool';
import mainStyles from '../styles/main.module.css';
import moduleStyles from './AuthPasswordChange.module.css';
import { isNullOrUndefined, logAudit } from '@shared';
import { AuthPasswordReset, Home, useNavigateToPage } from '..';
import {
  AuthContainer,
  AuthInputTextField,
  AuthSubmitButton,
} from '../components/AuthComponents';
import { CognitoUser } from 'amazon-cognito-identity-js';

const styles = {
  ...mainStyles,
  ...moduleStyles,
};

declare interface AuthPasswordResetChangeProps {
  email: string;
}

export function AuthPasswordResetChange({
  email,
}: AuthPasswordResetChangeProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [verificationCodeError, setVerificationCodeError] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState(false);
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigateToPage = useNavigateToPage();

  if (isNullOrUndefined(email)) {
    navigateToPage(AuthPasswordReset);
  }

  const changePassword = useCallback(() => {
    setErrorMessage('');
    let hasErrors: boolean = false;

    if (newPassword === '') {
      hasErrors = true;
      setNewPasswordError(true);
    }

    if (confirmNewPassword === '') {
      hasErrors = true;
      setConfirmNewPasswordError(true);
    }

    const user = new CognitoUser({
      Username: email,
      Pool: UserPool,
    });

    //const user = UserPool.getCurrentUser();

    if (hasErrors || isNullOrUndefined(user)) {
      return;
    }

    user.confirmPassword(verificationCode, newPassword, {
      onFailure(error) {
        logAudit(user.confirmPassword, 'Change password failure', {
          email: email,
        });
        setErrorMessage(error.message);
      },
      onSuccess() {
        logAudit(user.confirmPassword, 'Change password success', {
          email: email,
        });
        alert('Password changed successfully');
        navigateToPage(Home);
      },
    });
  }, [
    setErrorMessage,
    setNewPasswordError,
    setConfirmNewPasswordError,
    UserPool,
    verificationCode,
    newPassword,
    confirmNewPassword,
  ]);

  const handleChangeVerificationCode = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setVerificationCode(event.target.value);
      setVerificationCodeError(false);
    },
    [
      setVerificationCode,
      setVerificationCodeError,
      verificationCode,
      verificationCodeError,
    ],
  );

  const handleChangeNewPassword = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setNewPassword(event.target.value);
      setNewPasswordError(false);
    },
    [setNewPassword, setNewPasswordError, newPassword, newPasswordError],
  );

  const handleChangeConfirmNewPassword = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setConfirmNewPassword(value);
      setConfirmNewPasswordError(false);
    },
    [
      setConfirmNewPassword,
      setConfirmNewPasswordError,
      confirmNewPassword,
      confirmNewPasswordError,
    ],
  );

  return (
    <AuthContainer title="Change password">
      <form
        onSubmit={(event: ChangeEvent<HTMLFormElement>) => {
          event.preventDefault();
          changePassword();
        }}
      >
        {errorMessage && <div className={styles.errorText}>{errorMessage}</div>}
        <AuthInputTextField
          label="Enter verification code you received"
          id="verificationcode"
          type="password"
          placeholder="Enter the verification code that you received"
          value={verificationCode}
          onChange={handleChangeVerificationCode}
          error={verificationCodeError}
        />
        <AuthInputTextField
          label="Enter your new password"
          id="newpassword"
          type="password"
          placeholder="Enter your new password"
          value={newPassword}
          onChange={handleChangeNewPassword}
          error={newPasswordError}
        />

        <AuthInputTextField
          label="Confirm your new password"
          id="confirmpassword"
          type="password"
          placeholder="Confirm your new password"
          value={confirmNewPassword}
          onChange={handleChangeConfirmNewPassword}
          error={confirmNewPasswordError}
        />
        <div className="mt-7">
          <AuthSubmitButton title="Submit" />
        </div>
      </form>
    </AuthContainer>
  );
}
