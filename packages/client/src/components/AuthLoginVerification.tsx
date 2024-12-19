import { UnauthenticatedHeader } from "..";
import { Link } from "react-router-dom";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import mainStyles from "../styles/main.module.css";
import moduleStyles from "../pages/AuthLogin.module.css";
import { Button, InputAdornment, TextField } from "@mui/material";
import { ChangeEvent } from "react";
import { CustomizedTextInput } from "@shared/customizedTextField";

const styles = {
  ...mainStyles,
  ...moduleStyles
};

export interface AuthLoginVerificationProps {
  errorMessage: string;
  verificationCode: string;
  hasVerificationCodeError: boolean;
  handleChangeVerificationCode: (event: ChangeEvent<HTMLInputElement>) => void;
  handleClickVerifyCode: () => void;
  handleClickRequestNewCode: () => void;
}

export function AuthLoginVerification(props: AuthLoginVerificationProps) {
  const { errorMessage, verificationCode, hasVerificationCodeError,
    handleChangeVerificationCode, handleClickVerifyCode, handleClickRequestNewCode } = props;

  return (
    <>
      <UnauthenticatedHeader />
      <div className={styles.main}>
        <div className={styles.h3Text}>
          Multi Factor Authorization
        </div>
        <div className={styles.captionText}>
          Enter the validation code sent to your email.
        </div>
        <div>
          <form>
            <div className={styles.errorText}>{errorMessage}</div>
            <CustomizedTextInput
              id="verificationCode"
              placeholder="Enter the verification code"
              variant="outlined"
              fullWidth
              value={verificationCode}
              error={hasVerificationCodeError}
              onChange={handleChangeVerificationCode}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineIcon />
                  </InputAdornment>
                ),
                classes: {
                  error: styles.textboxError,
                  root: styles.textbox,
                },
              }}
            />

            <Button className={styles.buttonType1} onClick={handleClickVerifyCode}>
              Send Verification Code
            </Button>
            <Button className={styles.buttonType4} onClick={handleClickRequestNewCode}>
              Request New Verification Code
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}