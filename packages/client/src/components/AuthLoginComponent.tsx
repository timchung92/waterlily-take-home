import { ChangeEvent, useCallback, useState } from 'react';
import { useNavigateToPage } from '..';
import { AuthPasswordReset } from '../pages';
import {
  AuthInputTextField,
  AuthSubmitButton,
} from '../components/AuthComponents';

export interface AuthLoginComponentProps {
  username: string;
  password: string;
  hasUsernameError: boolean;
  hasPasswordError: boolean;
  errorMessage: string;
  onChangeUsername: (event: ChangeEvent<HTMLInputElement>) => void;
  onChangePassword: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmitLogin: () => void;
}

export function AuthLoginComponent(props: AuthLoginComponentProps) {
  const {
    username,
    password,
    hasUsernameError,
    hasPasswordError,
    errorMessage,
    onChangeUsername,
    onChangePassword,
    onSubmitLogin,
  } = props;

  const navigateToPage = useNavigateToPage();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleClickForgotPassword = useCallback(() => {
    navigateToPage(AuthPasswordReset);
    setShowForgotPassword(true);
  }, [setShowForgotPassword]);

  const handleSubmitLogin = useCallback(
    (event: ChangeEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmitLogin();
    },
    [onSubmitLogin],
  );

  return (
    <>
      <form
        onSubmit={handleSubmitLogin}
        className="space-y-6"
      >
        <div className="font-semibold text-red-600">{errorMessage}</div>
        <AuthInputTextField
          label="Email address"
          id="email"
          placeholder="Email address"
          value={username}
          onChange={onChangeUsername}
          error={hasUsernameError}
          autoComplete="email"
        />

        <AuthInputTextField
          label="Password"
          id="password"
          placeholder="Password"
          value={password}
          onChange={onChangePassword}
          error={hasPasswordError}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <div className="text-sm leading-6">
            {showForgotPassword ? (
              <div className="text-red-600">
                Please contact{' '}
                <a
                  href="mailto:hello@joinwaterlily.com?subject=Help+resetting+application+password"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-darkPurple hover:text-mediumPurple"
                >
                  hello@joinwaterlily.com
                </a>
                .
              </div>
            ) : (
              <button
                type="button"
                onClick={handleClickForgotPassword}
                className="font-semibold text-darkPurple hover:text-mediumPurple"
              >
                Forgot password?
              </button>
            )}
          </div>
        </div>

        <AuthSubmitButton title="Sign in" />
      </form>
    </>
  );
}
