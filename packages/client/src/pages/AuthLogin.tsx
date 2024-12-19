import { ChangeEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AuthenticationDetails,
  ChallengeName,
  CognitoUser,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import {
  closeSession,
  fetchAdvisorExistsByAdvisorEmailForPublicRequest,
  fetchSessionForAuthRequest,
  putAdvisorConsentByAdvisorIdRequest,
  selectSession,
  storeCognitoSession,
  storePotentialNewAdvisor,
} from '..';
import UserPool from '../util/UserPool';
import {
  SessionType,
  fakeLocalPlainSessionHybrid,
  isNullOrUndefined,
  isNullUndefinedOrEmpty,
  jsonStringifyBetter,
  localBypassAuthStorageKey,
  logAudit,
  termsOfServiceDef,
  useLocalAuthBypass,
} from '@shared';
import {
  AuthLoginComponent,
  AuthLoginVerification,
  AuthPasswordChangeForm,
  AuthPasswordChangeFormInputs,
  AuthPasswordChangeFormPrompts,
} from '../components';
import LoadingAnimation from '../components/MoonLoaderAnimation';
import { AuthMFASetup } from './AuthMFASetup';
import { AuthMFASignIn } from './AuthMFASignIn';
import { AuthContainer } from '../components/AuthComponents';
import { AuthTermsOfService } from './AuthTermsOfService';

interface CognitoRequiredAttributes {
  given_name: string;
  family_name: string;
}
interface CognitoUserAttributes extends CognitoRequiredAttributes {
  email: string;
}

export function AuthLogin() {
  const session = useSelector(selectSession);
  const dispatch = useDispatch();
  const [plainSession, setPlainSession] = useState(
    {} as PlainCognitoUserSession | null,
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [cognitoUser, setCognitoUser] = useState({} as CognitoUser);
  const [newPasswordRequiredAdvisorEmail, setNewPasswordRequiredAdvisorEmail] =
    useState(null as null | string);
  const [authPasswordChangeFormPrompts, setAuthPasswordChangeFormPrompts] =
    useState(null as null | AuthPasswordChangeFormPrompts);
  const [hasVerificationCodeError, setHasVerificationCodeError] =
    useState(false);
  const [hasUsernameError, setHasUsernameError] = useState(false);
  const [hasPasswordError, setHasPasswordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [softwareToken, setSoftwareToken] = useState(null as null | string);
  const [totpCode, setTotpCode] = useState<string>('');
  const [hasTotpCodeError, setHasTotpCodeError] = useState(false);
  const [showTotpInput, setShowTotpInput] = useState(false);
  const [totpSignInCode, setTotpSignInCode] = useState('');
  const [hasTotpSignInCodeError, setHasTotpSignInCodeError] = useState(false);

  const { potentialNewAdvisor } = session;

  useEffect(() => {
    if (
      potentialNewAdvisor === null ||
      newPasswordRequiredAdvisorEmail !== potentialNewAdvisor.advisorEmail
    ) {
      return;
    }

    // we're doing force change password flow, which could be a new user

    const { advisorExists } = potentialNewAdvisor;

    setAuthPasswordChangeFormPrompts({
      promptForVerificationCode: false,
      promptForCurrentPassword: false,
      promptForFirstAndLastName: !advisorExists,
    });
  }, [
    newPasswordRequiredAdvisorEmail,
    potentialNewAdvisor,
    setAuthPasswordChangeFormPrompts,
    setNewPasswordRequiredAdvisorEmail,
  ]);

  const handleAuthenticateSuccess = (newCognitoSession: CognitoUserSession) => {
    // AWS returns us a class-based deep object that we don't want to stick into Redux
    // so we're converting it to a plain object with a more-precise definition
    // Normally, don't ever do this, it's usually bad...
    const plainSession = JSON.parse(
      JSON.stringify(newCognitoSession),
    ) as PlainCognitoUserSession;
    plainSession.isValid = newCognitoSession.isValid();
    logAudit(handleAuthenticateSuccess, 'Logged in succesfully', {
      email: plainSession.idToken.payload.email,
    });

    // if we have a magic link session, remove it from local storage and close the session
    dispatch(closeSession());
    // store the advisor session
    setPlainSession(plainSession);
    dispatch(storeCognitoSession(plainSession));
    dispatch(fetchSessionForAuthRequest());
    if (newPasswordRequiredAdvisorEmail) {
      setShowEnableMfa(true);
    } else {
      dispatch(fetchSessionForAuthRequest());
      hideMfa();
    }
  };

  const handleAuthenticateFailure = (ex: unknown) => {
    if (ex instanceof Object) {
      setErrorMessage('message' in ex ? (ex.message as string) : String(ex));
      logAudit(handleAuthenticateFailure, 'Login failed', {
        message: ex,
      });
    }
  };

  const handleAuthenticateNewPasswordRequired = (
    userAttributes: CognitoUserAttributes,
    _requiredAttributes: CognitoRequiredAttributes,
  ) => {
    const { email: advisorEmail } = userAttributes;
    setNewPasswordRequiredAdvisorEmail(advisorEmail);
    dispatch(
      fetchAdvisorExistsByAdvisorEmailForPublicRequest({ advisorEmail }),
    );
  };

  const handleAuthenticateMfaRequired = (
    challengeName: ChallengeName,
    challengeParameters: any,
  ) => {
    console.log('mfaRequired', { challengeName, challengeParameters });
    setErrorMessage('SMS MFA not supported yet.');
  };

  const handleAuthenticateTotpRequired = (
    challengeName: ChallengeName,
    challengeParameters: any,
  ) => {
    setShowTotpInput(true);
  };

  const handleAuthenticateCustomChallenge = (challengeParameters: any) => {
    //setVerificationModalOpen(true)
    console.log('customChallenge', { challengeParameters });
    setErrorMessage('customChallenge not supported yet.');
  };

  const handleAuthenticateMfaSetup = (
    challengeName: ChallengeName,
    challengeParameters: any,
  ) => {
    cognitoUser?.associateSoftwareToken({
      associateSecretCode(secretCode) {
        // send the secret code to the user
        setSoftwareToken(secretCode);
      },
      onFailure: handleAuthenticateFailure,
    });
  };

  const handleAuthenticateSelectMfaType = (
    challengeName: ChallengeName,
    challengeParameters: any,
  ) => {
    console.log('selectMFAType', { challengeName, challengeParameters });
    setErrorMessage('selectMFAType not supported yet.');
  };

  const gatherAuthenticationCallbacks = () => ({
    onSuccess: handleAuthenticateSuccess,
    onFailure: handleAuthenticateFailure,
    newPasswordRequired: handleAuthenticateNewPasswordRequired,
    mfaRequired: handleAuthenticateMfaRequired,
    totpRequired: handleAuthenticateTotpRequired,
    customChallenge: handleAuthenticateCustomChallenge,
    mfaSetup: handleAuthenticateMfaSetup,
    selectMFAType: handleAuthenticateSelectMfaType,
  });

  const handleSubmitLogin = () => {
    if (isNullUndefinedOrEmpty(username)) {
      setErrorMessage('E-mail is required.');
      setHasUsernameError(true);
      return;
    }
    if (isNullOrUndefined(password)) {
      setErrorMessage('Password is required.');
      setHasPasswordError(true);
      return;
    }
    setErrorMessage('');
    setHasUsernameError(false);
    setHasPasswordError(false);

    const authDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const user = new CognitoUser({
      Username: username,
      Pool: UserPool,
    });

    setCognitoUser(user);
    user.setAuthenticationFlowType('USER_PASSWORD_AUTH');

    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (useLocalAuthBypass()) {
      const localBypassAuthPlainSessionHybrid =
        fakeLocalPlainSessionHybrid(username);
      localStorage.setItem(
        localBypassAuthStorageKey,
        jsonStringifyBetter(localBypassAuthPlainSessionHybrid),
      );
      gatherAuthenticationCallbacks().onSuccess(
        localBypassAuthPlainSessionHybrid as unknown as CognitoUserSession,
      );
      return;
    }
    user.authenticateUser(authDetails, gatherAuthenticationCallbacks());
  };

  const handleSubmitChangePassword = (
    authPasswordChangeFormInputs: AuthPasswordChangeFormInputs,
  ) => {
    const {
      advisorFirstName,
      advisorLastName,
      organizationName,
      newPassword,
      organizationDisplayName,
    } = authPasswordChangeFormInputs;

    if (password === newPassword) {
      setErrorMessage(
        'New password cannot be the same as the temporary password.',
      );
      return;
    } else {
      setErrorMessage('');
    }

    dispatch(
      storePotentialNewAdvisor({
        advisorExists: false,
        advisorEmail: newPasswordRequiredAdvisorEmail!,
        ...potentialNewAdvisor,
        advisorFirstName,
        advisorLastName,
        organizationName,
        organizationDisplayName,
      }),
    );
    cognitoUser?.completeNewPasswordChallenge(
      newPassword,
      {
        given_name: advisorFirstName,
        family_name: advisorLastName,
      } as CognitoRequiredAttributes,
      {
        ...gatherAuthenticationCallbacks(),
        // override the onSuccess callback to re-authenticate with the new password
        // so that we have given_name and family_name in the session
        onSuccess: (session: CognitoUserSession) => {
          const newCredentials = new AuthenticationDetails({
            Username: newPasswordRequiredAdvisorEmail!,
            Password: newPassword,
          });
          cognitoUser.authenticateUser(
            newCredentials,
            gatherAuthenticationCallbacks(),
          );
        },
      },
    );
  };

  const handleClickVerifyCode = () => {
    if (isNullUndefinedOrEmpty(verificationCode)) {
      setErrorMessage(
        'Verification code is required. Please check your email. Contact hello@joinwaterlily.com for assistance',
      );
      setHasVerificationCodeError(true);
      return;
    }

    setErrorMessage('');
    setHasVerificationCodeError(false);
    !isNullUndefinedOrEmpty(cognitoUser) &&
      cognitoUser.confirmRegistration(
        verificationCode,
        true,
        function (error, result) {
          if (error) {
            setErrorMessage(error.message);
            return;
          }
          if (!isNullUndefinedOrEmpty(plainSession)) {
            dispatch(storeCognitoSession(plainSession));
            dispatch(fetchSessionForAuthRequest());
            setVerificationModalOpen(false);
          }
        },
      );
  };

  const handleClickRequestNewCode = () => {
    const user = new CognitoUser({
      Username: username,
      Pool: UserPool,
    });
    user.resendConfirmationCode(() => {
      setErrorMessage('');
    });
  };

  const handleChangeUsername = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
    setHasUsernameError(false);
  };

  const handleChangePassword = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setHasPasswordError(false);
  };

  const handleChangeVerificationCode = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setVerificationCode(event.target.value);
    setHasVerificationCodeError(false);
  };

  const handleChanceTotpCode = (event: ChangeEvent<HTMLInputElement>) => {
    setTotpCode(event.target.value);
    setHasTotpCodeError(false);
  };

  const handleChangeTotpSignInCode = (event: ChangeEvent<HTMLInputElement>) => {
    setTotpSignInCode(event.target.value);
    setHasTotpSignInCodeError(false);
  };

  const hideMfa = () => {
    setShowEnableMfa(false);
    setSoftwareToken(null);
    setShowTotpInput(false);
  };

  const handleClickVerifyTotpCode = () => {
    if (isNullUndefinedOrEmpty(totpCode)) {
      setErrorMessage('Verification code is required.');
      setHasTotpCodeError(true);
      return;
    }

    if (!isNullUndefinedOrEmpty(cognitoUser)) {
      cognitoUser.verifySoftwareToken(totpCode, 'MFA Device', {
        ...gatherAuthenticationCallbacks(),
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
                setErrorMessage(err.message);
              } else if (!isNullUndefinedOrEmpty(plainSession)) {
                dispatch(fetchSessionForAuthRequest());
                hideMfa();
              }
            },
          );
        },
      });
    }
  };

  const handleClickSignInTotpCode = () => {
    if (isNullUndefinedOrEmpty(totpSignInCode)) {
      setErrorMessage('Verification code is required.');
      setHasTotpSignInCodeError(true);
      return;
    }

    if (!isNullUndefinedOrEmpty(cognitoUser)) {
      cognitoUser.sendMFACode(
        totpSignInCode,
        gatherAuthenticationCallbacks(),
        'SOFTWARE_TOKEN_MFA',
      );
    }
  };

  const [showEnableMfa, setShowEnableMfa] = useState(false);

  const handleEnableMfa = () => {
    cognitoUser?.associateSoftwareToken({
      associateSecretCode(secretCode) {
        // save the secret code & display qr code
        setSoftwareToken(secretCode);
        setShowEnableMfa(false);
      },
      onFailure: handleAuthenticateFailure,
    });
  };

  if (showEnableMfa || softwareToken) {
    return (
      <AuthMFASetup
        email={username}
        softwareToken={softwareToken}
        showEnableMfa={showEnableMfa}
        errorMessage={errorMessage}
        handleEnableMfa={handleEnableMfa}
        handleClickVerifyTotpCode={handleClickVerifyTotpCode}
        totpCode={totpCode}
        handleChanceTotpCode={handleChanceTotpCode}
        hasTotpCodeError={hasTotpCodeError}
        hideMfa={hideMfa}
      />
    );
  }

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

  const createNewAccountBtn = (
    <p className="mt-4 text-center text-sm text-gray-500">
      Not a member?{' '}
      <a
        href="https://waterlily.typeform.com/to/HMfXp9zw"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold leading-6 text-darkPurple hover:text-mediumPurple"
      >
        Create an account
      </a>
    </p>
  );

  if (session.sessionType === SessionType.advisorMissingConsents) {
    return (
      <AuthTermsOfService
        onAccept={() =>
          handleAcceptTermsOfService(dispatch, session.advisor?.advisorId!)
        }
      />
    );
  }

  return verificationModalOpen ? (
    <AuthLoginVerification
      errorMessage={errorMessage}
      verificationCode={verificationCode}
      hasVerificationCodeError={hasVerificationCodeError}
      handleChangeVerificationCode={handleChangeVerificationCode}
      handleClickVerifyCode={handleClickVerifyCode}
      handleClickRequestNewCode={handleClickRequestNewCode}
    />
  ) : authPasswordChangeFormPrompts ? (
    <AuthContainer title="Change your password">
      <AuthPasswordChangeForm
        {...authPasswordChangeFormPrompts}
        advisorEmail={newPasswordRequiredAdvisorEmail!}
        errorMessage={errorMessage}
        onSubmitChangePassword={handleSubmitChangePassword}
      />
    </AuthContainer>
  ) : (
    <>
      <AuthContainer
        title="Sign into your account"
        outsideBoxChildren={createNewAccountBtn}
      >
        <LoadingAnimation loading={session.isLoading} />
        <AuthLoginComponent
          username={username}
          password={password}
          hasUsernameError={hasUsernameError}
          hasPasswordError={hasPasswordError}
          errorMessage={errorMessage}
          onChangeUsername={handleChangeUsername}
          onChangePassword={handleChangePassword}
          onSubmitLogin={handleSubmitLogin}
        />
      </AuthContainer>
    </>
  );
}

export function handleAcceptTermsOfService(
  dispatch: any,
  advisorId: string,
): void {
  dispatch(
    putAdvisorConsentByAdvisorIdRequest({
      advisorId: advisorId,
      consentVersionDescription: termsOfServiceDef.consentVersionDescription,
      consentText: termsOfServiceDef.text,
    }),
  );
}
