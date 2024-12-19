import { ChangeEvent, useCallback, useState } from 'react';
import { CognitoUser } from 'amazon-cognito-identity-js';
import {
  AuthContainer,
  AuthInputTextField,
  AuthPrimaryButton,
  AuthSubmitButton,
  Home,
  PageLink,
  useNavigateToPage,
} from '..';
import UserPool from '../util/UserPool';
import styles from '../styles/main.module.css';
import { AuthPasswordResetChange } from './AuthPasswordResetChange';
import { emailRegex } from '@shared/constants';
import { logAudit } from '@shared';

export function AuthPasswordReset() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigateToPage = useNavigateToPage();

  const resetPassword = useCallback(() => {
    if (!emailRegex.test(email)) {
      setEmailError(true);
      return;
    }

    const user = new CognitoUser({
      Username: email,
      Pool: UserPool,
    });

    user.forgotPassword({
      onSuccess: data => {
        logAudit(user.forgotPassword, 'Forgot password requested', {
          email: email,
        });
        navigateToPage(AuthPasswordResetChange, { email });
      },
      onFailure: error => {
        if (error) {
          logAudit(
            user.forgotPassword,
            'Forgot password verification failure',
            {
              error: error,
            },
          );
          setErrorMessage(error.message);
        }
      },
    });
  }, [navigateToPage, setEmailError, setErrorMessage, email]);

  const handleChangeEmail = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setEmail(event.target.value);
      setEmailError(false);
    },
    [setEmail, setEmailError],
  );

  return (
    <AuthContainer title="Reset Password">
      <form
        onSubmit={(event: ChangeEvent<HTMLFormElement>) => {
          event.preventDefault();
          resetPassword();
        }}
        className="flex flex-col gap-4"
      >
        {errorMessage && <div className={styles.errorText}>{errorMessage}</div>}
        <AuthInputTextField
          label="Email address"
          id="email"
          placeholder="Email address"
          value={email}
          onChange={handleChangeEmail}
          error={emailError}
          autoComplete="email"
        />

        <AuthSubmitButton title="Send Link" />
      </form>
    </AuthContainer>
  );
}
