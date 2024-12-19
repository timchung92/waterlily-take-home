import { DevicePhoneMobileIcon } from '@heroicons/react/20/solid';
import { InputAdornment, Button } from '@mui/material';
import { CustomizedTextInput, SessionType } from '@shared';
import { ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AuthTermsOfService,
  fetchSessionForAuthRequest,
  handleAcceptTermsOfService,
  selectSession,
} from '..';
import {
  AuthContainer,
  AuthInputTextField,
  AuthSubmitButton,
  AuthPrimaryButton,
} from '../components/AuthComponents';
import mainStyles from '../styles/main.module.css';
import moduleStyles from '../pages/AuthLogin.module.css';
import QRCode from 'react-qr-code';

const styles = { ...mainStyles, ...moduleStyles };

export function AuthMFASetup({
  email,
  softwareToken,
  showEnableMfa,
  errorMessage,
  handleEnableMfa,
  handleClickVerifyTotpCode,
  totpCode,
  handleChanceTotpCode,
  hasTotpCodeError,
  hideMfa,
}: {
  email: string;
  softwareToken: string | null;
  showEnableMfa: boolean;
  errorMessage: string | null;
  handleClickVerifyTotpCode: () => void;
  totpCode: string;
  handleChanceTotpCode: (event: ChangeEvent<HTMLInputElement>) => void;
  hasTotpCodeError: boolean;
  handleEnableMfa?: () => void;
  hideMfa?: () => void;
}) {
  const dispatch = useDispatch();

  const handleSkipMfaSetUp = () => {
    dispatch(fetchSessionForAuthRequest());

    if (hideMfa) {
      hideMfa();
    }
  };
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleClickVerifyTotpCode();
  };

  if (showEnableMfa) {
    return (
      <AuthContainer title="Keep your account secure">
        <div className="grid grid-cols-1 gap-4">
          {errorMessage ? (
            <div className={styles.errorText}>{errorMessage}</div>
          ) : null}
          <p className="py-2 text-lg text-gray-700">
            We strongly recommend enabling Multi-Factor Authentication (MFA) to
            secure your account. It only takes about 2 minutes.
          </p>
          <AuthPrimaryButton
            onClick={handleEnableMfa}
            title="Enable MFA (recommended)"
          />

          <button
            className="rounded-full bg-white px-8 py-2 text-base font-semibold text-darkPurple hover:text-mediumPurple focus:outline-none"
            onClick={handleSkipMfaSetUp}
          >
            Skip
          </button>
        </div>
      </AuthContainer>
    );
  }

  if (softwareToken) {
    return (
      <AuthContainer title="Set up Multi-factor Authentication">
        <div className="pb-4 text-gray-700">
          <p>
            Use your authenticator app (e.g., Google Authenticator, Authy, Duo)
            to scan the QR code.
          </p>
        </div>

        <div className="my-2 px-12">
          <QRCode
            size={400}
            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            value={`otpauth://totp/Waterlily:${email}?secret=${softwareToken}`}
            viewBox={`0 0 300 300`}
          />
        </div>

        <form
          className="mt-4"
          onSubmit={onSubmit}
        >
          {errorMessage ? (
            <div className="py-1 text-center text-base text-red-500">
              {errorMessage}
            </div>
          ) : null}
          <AuthInputTextField
            id="verificationCode"
            label="Enter verification code"
            value={totpCode}
            onChange={handleChanceTotpCode}
            error={hasTotpCodeError}
          />
          <div className="mt-4">
            <AuthSubmitButton title="Verify" />
          </div>
        </form>
        <div className="mt-4 text-sm italic text-gray-700">
          <p>
            Need help? Check out our{' '}
            <a
              href="https://help.joinwaterlily.com/en/articles/9682389-how-to-set-up-multi-factor-authentication-mfa"
              target="_blank"
              className="font-medium text-darkPurple underline hover:text-mediumPurple"
            >
              support article
            </a>{' '}
            step-by-step instructions on setting up Multi-Factor Authentication
            (MFA).
          </p>
        </div>
      </AuthContainer>
    );
  }

  return null;
}
