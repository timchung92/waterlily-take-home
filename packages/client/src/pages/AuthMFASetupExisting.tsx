import { isNullUndefinedOrEmpty, SessionType } from '@shared';
import mainStyles from '../styles/main.module.css';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectSession } from '../model';
import UserPool from '../util/UserPool';
import { AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';
import { AuthMFASetup } from './AuthMFASetup';
import {
  AuthContainer,
  AuthInputTextField,
  AuthSubmitButton,
} from '../components/AuthComponents';

import { FaCircleCheck } from 'react-icons/fa6';
import { BackToDashboardButton } from '../components/BackToDashboardButton';

const styles = { ...mainStyles };

export function AuthMFASetupExisting() {
  const [password, setPassword] = useState('');
  const [hasPasswordError, setHasPasswordError] = useState(false);
  const [cognitoUser, setCognitoUser] = useState<CognitoUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [softwareToken, setSoftwareToken] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [hasTotpCodeError, setHasTotpCodeError] = useState(false);
  const [hasMFAEnabled, setHasMFAEnabled] = useState(false);
  const [wasSetupSuccessful, setWasSetupSuccessful] = useState(false);

  const session = useSelector(selectSession);

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleAuthenticationError = (err: unknown) => {
    if (err instanceof Error) {
      setError(err.message);
    }
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password) {
      setHasPasswordError(true);
      setError('Password is required');
      return;
    }
    setHasPasswordError(false);
    if (!session.advisor) {
      setError('Advisor not found');
      return;
    }
    const user = new CognitoUser({
      Username: session.advisor?.advisorEmail,
      Pool: UserPool,
    });
    setCognitoUser(user);
    const authDetails = new AuthenticationDetails({
      Username: session.advisor?.advisorEmail,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: result => {
        let hasMFAEnabled = false;
        setError(null);
        user.getMFAOptions((err, mfaOptions) => {
          if (err && err instanceof Error) {
            setError(err.message);
          } else {
            if (mfaOptions && mfaOptions.length > 0) {
              hasMFAEnabled = true;
            }
          }
        });
        setHasMFAEnabled(hasMFAEnabled);
        if (!hasMFAEnabled) {
          user?.associateSoftwareToken({
            associateSecretCode(secretCode) {
              // save the secret code & display qr code
              setSoftwareToken(secretCode);
              setError(null);
            },
            onFailure: handleAuthenticationError,
          });
        }
      },
      onFailure: handleAuthenticationError,
      totpRequired: function () {
        setHasMFAEnabled(true);
        setError(null);
      },
    });
  };

  const handleChangeTotpCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTotpCode(event.target.value);
  };

  const handleClickVerifyTotpCode = () => {
    if (isNullUndefinedOrEmpty(totpCode)) {
      setError('Verification code is required.');
      setHasTotpCodeError(true);
      return;
    }

    if (!isNullUndefinedOrEmpty(cognitoUser)) {
      cognitoUser.verifySoftwareToken(totpCode, 'MFA Device', {
        onSuccess: () => {
          const totpMfaSettings = {
            PreferredMfa: true,
            Enabled: true,
          };
          cognitoUser.setUserMfaPreference(
            null,
            totpMfaSettings,
            function (err, result) {
              if (err && err instanceof Error) {
                setError(err.message);
              } else {
                setError(null);
                setWasSetupSuccessful(true);
              }
            },
          );
        },
        onFailure: handleAuthenticationError,
      });
    }
  };

  if (softwareToken && session.advisor?.advisorEmail && !wasSetupSuccessful) {
    return (
      <AuthMFASetup
        softwareToken={softwareToken}
        email={session.advisor?.advisorEmail}
        showEnableMfa={false}
        errorMessage={error}
        handleClickVerifyTotpCode={handleClickVerifyTotpCode}
        totpCode={totpCode}
        handleChanceTotpCode={handleChangeTotpCode}
        hasTotpCodeError={hasTotpCodeError}
      />
    );
  }

  let body;
  if (hasMFAEnabled) {
    body = (
      <p className="px-3 py-4 text-center text-lg text-gray-700">
        Multi-factor authentication is already enabled for this account.
      </p>
    );
  } else if (wasSetupSuccessful) {
    body = (
      <p className="flex flex-col items-center gap-4 py-6 text-center text-lg text-gray-700">
        <FaCircleCheck className="h-10 w-10 text-green-500" />
        Multi-factor authentication has successfully been enabled for this
        account.
      </p>
    );
  } else {
    body = (
      <>
        <p className="pt-4 text-base text-gray-700">
          Enter your password to enable MFA
        </p>
        <form onSubmit={onSubmit}>
          <AuthInputTextField
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={handleChangePassword}
            error={hasPasswordError}
            autoComplete="current-password"
          />
          <div className="mt-4">
            <AuthSubmitButton title="Enable MFA" />
          </div>
        </form>
      </>
    );
  }

  return (
    <AuthContainer
      title="Multi-factor Authentication Setup"
      outsideBoxChildren={<BackToDashboardButton className="justify-center" />}
    >
      {error ? <div className={styles.errorText}>{error}</div> : null}
      {body}
    </AuthContainer>
  );
}
