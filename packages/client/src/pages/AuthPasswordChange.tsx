import { ChangeEvent, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import UserPool from '../util/UserPool';
import { AuthMFASignIn, closeSession, selectSession } from '..';
import {
  AuthContainer,
  AuthInputTextField,
  AuthSubmitButton,
} from '../components/AuthComponents';

import mainStyles from '../styles/main.module.css';
import moduleStyles from './AuthPasswordChange.module.css';
import { logAudit } from '@shared';
import { useNavigate } from 'react-router';
import { BackToDashboardButton } from '../components/BackToDashboardButton';

const styles = {
  ...mainStyles,
  ...moduleStyles,
};

export function AuthPasswordChange() {
  const sessionUser = useSelector(selectSession);
  const [cognitoUser, setCognitoUser] = useState({} as CognitoUser);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [oldPasswordError, setOldPasswordError] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState(false);
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showTotpInput, setShowTotpInput] = useState(false);
  const [totpSignInCode, setTotpSignInCode] = useState('');

  const [hasTotpSignInCodeError, setHasTotpSignInCodeError] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleAuthenticateSuccess = (newCognitoSession: CognitoUserSession) => {
    logAudit(handleAuthenticateSuccess, 'Password change successful', {
      session: newCognitoSession,
    });
    cognitoUser.changePassword(oldPassword, newPassword, (error, result) => {
      if (error) {
        setErrorMessage(error.message);
      } else {
        alert('Password changed successfully');
        cognitoUser.signOut();
        dispatch(closeSession());
        navigate('/');
      }
    });
  };

  const handleAuthenticateFailure = (error: Error) => {
    setErrorMessage(error.message);
    console.log('handleAuthenticateFailure', error);
    logAudit(handleAuthenticateFailure, 'Password change failed', {
      error: error.message,
    });
  };

  const handleAuthenticateTotpRequired = () => {
    setShowTotpInput(true);
  };

  const gatherAuthenticationCallbacks = () => ({
    onFailure: handleAuthenticateFailure,
    totpRequired: handleAuthenticateTotpRequired,
  });

  const submitChangePassword = useCallback(() => {
    setErrorMessage('');
    let hasErrors = false;

    if (newPassword !== confirmNewPassword) {
      setConfirmNewPasswordError(true);
      setErrorMessage('Passwords do not match');
      hasErrors = true;
    }

    if (!sessionUser.advisor?.advisorEmail) {
      hasErrors = true;
      setErrorMessage('User session is missing');
      return;
    }
    const user = new CognitoUser({
      Username: sessionUser.advisor?.advisorEmail,
      Pool: UserPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: sessionUser.advisor?.advisorEmail,
      Password: oldPassword,
    });

    setCognitoUser(user);
    user.setAuthenticationFlowType('USER_PASSWORD_AUTH');

    if (hasErrors) return;

    user.authenticateUser(authDetails, {
      ...gatherAuthenticationCallbacks(),
      onSuccess: () => {
        user.changePassword(oldPassword, newPassword, (error, result) => {
          if (error) {
            setErrorMessage(error.message);
          } else {
            alert('Password changed successfully');
            user.signOut();
            dispatch(closeSession());
            navigate('/');
          }
        });
      },
    });
  }, [
    oldPassword,
    newPassword,
    confirmNewPassword,
    sessionUser,
    dispatch,
    navigate,
  ]);

  const handleChangeOldPassword = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setOldPassword(event.target.value);
      setOldPasswordError(false);
    },
    [setOldPassword, setOldPasswordError],
  );

  const handleChangeNewPassword = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setNewPassword(event.target.value);
      setNewPasswordError(false);
    },
    [setNewPassword, setNewPasswordError],
  );

  const handleChangeConfirmNewPassword = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setConfirmNewPassword(event.target.value);
      setConfirmNewPasswordError(false);
    },
    [setConfirmNewPassword, setConfirmNewPasswordError],
  );

  const handleChangeTotpSignInCode = (event: ChangeEvent<HTMLInputElement>) => {
    setTotpSignInCode(event.target.value);
    setHasTotpSignInCodeError(false);
  };

  const handleClickSignInTotpCode = () => {
    if (totpSignInCode === '') {
      setErrorMessage('Verification code is required.');
      setHasTotpSignInCodeError(true);
      return;
    }

    if (sessionUser.advisor?.advisorEmail) {
      cognitoUser.sendMFACode(
        totpSignInCode,
        {
          onSuccess: handleAuthenticateSuccess,
          onFailure: handleAuthenticateFailure,
        },
        'SOFTWARE_TOKEN_MFA',
      );
    }
  };

  if (showTotpInput) {
    return (
      <AuthContainer title="Enter your one-time passcode">
        <AuthMFASignIn
          totpSignInCode={totpSignInCode}
          handleChangeTotpSignInCode={handleChangeTotpSignInCode}
          hasTotpSignInCodeError={hasTotpSignInCodeError}
          handleClickSignInTotpCode={handleClickSignInTotpCode}
          errorMessage={errorMessage}
        />
      </AuthContainer>
    );
  }

  return (
    <AuthContainer
      title="Change password"
      outsideBoxChildren={<BackToDashboardButton className="justify-center" />}
    >
      <form
        className="-mt-3"
        onSubmit={event => {
          event.preventDefault(); // Prevent the default form submission
          submitChangePassword();
        }}
      >
        <div className={styles.errorText}>{errorMessage}</div>
        <AuthInputTextField
          id="oldpassword"
          label="Enter your current password"
          type="password"
          autoComplete="current-password"
          value={oldPassword}
          onChange={handleChangeOldPassword}
          error={oldPasswordError}
        />
        <AuthInputTextField
          id="newpassword"
          label="Enter your new password"
          type="password"
          value={newPassword}
          onChange={handleChangeNewPassword}
          error={newPasswordError}
          autoComplete="new-password"
        />

        <AuthInputTextField
          id="confirmpassword"
          label="Confirm your new password"
          type="password"
          value={confirmNewPassword}
          onChange={handleChangeConfirmNewPassword}
          error={confirmNewPasswordError}
        />

        <div className="mt-6">
          <AuthSubmitButton title="Submit" />
        </div>
      </form>
    </AuthContainer>
  );
}
