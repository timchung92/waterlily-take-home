import mainStyles from '../styles/main.module.css';
import {
  AuthInputTextField,
  AuthSubmitButton,
} from '../components/AuthComponents';
const styles = { ...mainStyles };

export function AuthMFASignIn({
  totpSignInCode,
  handleChangeTotpSignInCode,
  hasTotpSignInCodeError,
  handleClickSignInTotpCode,
  errorMessage,
}: {
  totpSignInCode: string;
  handleChangeTotpSignInCode: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  hasTotpSignInCodeError: boolean;
  handleClickSignInTotpCode: () => void;
  errorMessage: string | null;
}) {
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleClickSignInTotpCode();
  };
  return (
    <>
      {errorMessage ? (
        <div className={styles.errorText}>{errorMessage}</div>
      ) : null}
      <div className="grid grid-cols-1 gap-4">
        <p className="py-2 text-base text-gray-600 md:text-lg">
          Open your authenticator app (e.g., Google Authenticator, Authy, Duo)
          for the verification code.
        </p>
        <form onSubmit={onSubmit}>
          <AuthInputTextField
            label="Verification Code"
            id="verificationCode"
            placeholder="Enter the verification code"
            value={totpSignInCode}
            onChange={handleChangeTotpSignInCode}
            error={hasTotpSignInCodeError}
            autoComplete="off"
          />
          <div className="mt-4">
            <AuthSubmitButton title="Verify" />
          </div>
        </form>
      </div>
    </>
  );
}
