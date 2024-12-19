import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useParams } from 'react-router';
import {
  clearMagicLinkSession,
  fetchMagicLinkSessionForClientByTokenForPublicRequest,
  fetchSessionForAuthRequest,
  postVerifySecurityQuestionsMagicLinkForClientByClientIdRequest,
  putMagicLinkSessionByTokenForPublicRequest,
  selectMagicLinkIsLoading,
  selectMagicLinkSessionByToken,
  setClientSessionType,
} from '../model';
import { MdOutlineErrorOutline } from 'react-icons/md';

import { useEffect, useRef } from 'react';
import { maskEmail } from '@shared';
import mainStyles from '../styles/main.module.css';
import magicLinkStyles from './VerifyMagicLink.module.css';
import React from 'react';
import { FaCircleCheck } from 'react-icons/fa6';
import { AuthContainer } from '..';
import { BsSendCheck } from 'react-icons/bs';
import {
  SecurityVerificationForm,
  SecurityVerificationFormValues,
} from '@/components/SecurityVerificationForm';

const styles = {
  ...mainStyles,
  ...magicLinkStyles,
};

export const MAGIC_LINK_SESSION_STORAGE_KEY = 'magicLinkSession';

export function RequestNewMagicLinkButton({
  token,
}: {
  token: string | undefined;
}) {
  const [newLinkRequested, setNewLinkRequested] = React.useState(false);
  const isLoading = useSelector(selectMagicLinkIsLoading);
  const dispatch = useDispatch();

  const requestFreshMagicLink = () => {
    if (token && !isLoading) {
      localStorage.removeItem(MAGIC_LINK_SESSION_STORAGE_KEY);
      dispatch(putMagicLinkSessionByTokenForPublicRequest({ token }));
      setNewLinkRequested(true);
    }
  };

  return (
    <>
      {newLinkRequested ? (
        <>
          <p
            className={`mt-4 flex items-center justify-center gap-2 rounded-full ${
              isLoading ? 'bg-gray-100' : 'bg-green-50'
            } px-6 py-2 text-xl ${
              isLoading ? 'text-gray-600' : 'text-green-600'
            } shadow-md`}
          >
            {isLoading ? (
              <>
                Sending
                <span className="inline-block animate-spin">⟳</span>
              </>
            ) : (
              <>
                Sent
                <FaCircleCheck className="h-5 w-5 text-green-500" />
              </>
            )}
          </p>
          <p className="mt-4 text-center text-gray-700">
            {isLoading
              ? 'Preparing your new access link...'
              : 'A new link has been sent to your email. \nPlease check your inbox.'}
          </p>
        </>
      ) : (
        <div>
          <button
            className={`mt-4 w-full rounded-full ${
              isLoading
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-darkPurple hover:bg-mediumPurple hover:shadow-none'
            } px-6 py-2 text-xl text-white shadow-md`}
            onClick={requestFreshMagicLink}
            disabled={isLoading}
          >
            Send me a new link
          </button>
        </div>
      )}
    </>
  );
}

function LockoutScreen() {
  return (
    <AuthContainer title="Account Locked">
      <div className="space-y-2 text-base text-gray-900 md:text-lg">
        <h2 className="font-semibold">Multiple unsuccessful login attempts.</h2>
        <p className="">
          For your security, access to your account has been locked.
        </p>
        <h2 className="font-semibold">Contact us to regain access</h2>
        <p>
          Contact our support team by emailing{' '}
          <a
            href="mailto:hello@joinwaterlily.com"
            className="text-blue-600 underline"
          >
            hello@joinwaterlily.com
          </a>{' '}
          or use the message feature in the bottom right corner of your screen.
        </p>
      </div>
    </AuthContainer>
  );
}

export function VerifyMagicLink() {
  const { token } = useParams<{ token: string }>();
  const magicLinkSession = useSelector(selectMagicLinkSessionByToken);
  const dispatch = useDispatch();
  const initialFetchDone = useRef(false);
  const newLinkRequestSent = useRef(false);
  const isLoading = useSelector(selectMagicLinkIsLoading);

  useEffect(() => {
    // Only fetch the initial session once when component mounts
    dispatch(clearMagicLinkSession());
    if (token && !initialFetchDone.current) {
      initialFetchDone.current = true;
      localStorage.removeItem(MAGIC_LINK_SESSION_STORAGE_KEY);
      dispatch(fetchMagicLinkSessionForClientByTokenForPublicRequest(token));
    }
  }, [dispatch, token]);

  useEffect(() => {
    // if we have a magic link session, store it and fetch the session
    if (
      magicLinkSession.clientId &&
      magicLinkSession.status === 'sessionFetched' &&
      token === magicLinkSession.token
    ) {
      dispatch(setClientSessionType());
      dispatch(fetchSessionForAuthRequest());
      localStorage.setItem(
        MAGIC_LINK_SESSION_STORAGE_KEY,
        JSON.stringify(magicLinkSession),
      );
    }
  }, [dispatch, magicLinkSession, token]);

  useEffect(() => {
    // Handle expired/used tokens only once
    if (
      (magicLinkSession.status === 'expired' ||
        magicLinkSession.status === 'used') &&
      !newLinkRequestSent.current &&
      token
    ) {
      newLinkRequestSent.current = true;
      dispatch(putMagicLinkSessionByTokenForPublicRequest({ token }));
    }
  }, [magicLinkSession.status, dispatch, token]);

  if (magicLinkSession.status === 'locked') {
    return <LockoutScreen />;
  }

  if (
    magicLinkSession.clientId &&
    magicLinkSession.status === 'sessionFetched' &&
    token === magicLinkSession.token
  ) {
    return <VerificationForm clientId={magicLinkSession.clientId} />;
  }

  return (
    <AuthContainer title="Magic Link Verification">
      <div className="flex flex-col items-center justify-center gap-4 pb-4">
        {isLoading && (
          <div className="animate-spin text-4xl text-darkPurple">⟳</div>
        )}
        {magicLinkSession.status === 'newLinkSent' && (
          <BsSendCheck className="h-12 w-12 text-green-600" />
        )}
        <h1 className="max-w-lg px-2 text-center text-lg text-gray-900 md:text-xl">
          {isLoading
            ? 'Please wait while we verify your access...'
            : getMessage(magicLinkSession)}
        </h1>
      </div>
    </AuthContainer>
  );
}

function getMessage(session: MagicLink) {
  switch (session.status) {
    case 'sendingNew':
      return `Let's get you a new access link...`;
    case 'newLinkSent':
      return `An updated link has been sent to ${maskEmail(session.clientEmail)}`;
    case 'error':
      return `We encountered an error. Please try again or contact support.`;
    default:
      return 'Verifying magic link...';
  }
}

function VerificationForm({ clientId }: { clientId: string }) {
  const isLoading = useSelector(selectMagicLinkIsLoading);
  const magicLinkSession = useSelector(selectMagicLinkSessionByToken);
  const dispatch = useDispatch();

  const handleVerificationSubmit = (values: SecurityVerificationFormValues) => {
    dispatch(
      postVerifySecurityQuestionsMagicLinkForClientByClientIdRequest({
        clientId,
        dateOfBirth: values.dateOfBirth,
        zipCode: values.zipCode,
        height: values.height?.value ?? '',
        magicLinkId: magicLinkSession.magicLinkId,
      }),
    );
  };

  if (magicLinkSession.hasVerifiedSecurityQuestions) {
    return (
      <Navigate
        to={`/clients/${magicLinkSession.clientId}/onboarding/results-are-in`}
      />
    );
  }

  return (
    <AuthContainer title="Verify Your Identity">
      {magicLinkSession.hasVerifiedSecurityQuestions === false ? (
        <div className="flex max-w-xl flex-col gap-2 px-2">
          <h2 className="flex items-center gap-3 text-xl font-normal text-gray-900 md:text-2xl">
            Failed to Verify{' '}
            <MdOutlineErrorOutline className="h-6 w-6 md:h-7 md:w-7" />
          </h2>
          <p className="py-2 text-base text-gray-900 md:text-lg">
            At least one of your answers was incorrect. Click the link below to
            send an email for a new access link to view your results.
          </p>
          <div className="w-full py-2">
            <RequestNewMagicLinkButton token={magicLinkSession.token} />
          </div>
        </div>
      ) : (
        <div className="max-w-xl px-3">
          <h2 className="text-xl font-normal text-gray-900">
            Security Questions
          </h2>
          <div className="mb-4 mt-1 text-base text-gray-500">
            Please answer the following security question to verify your
            identity
          </div>
          <SecurityVerificationForm
            onSubmit={handleVerificationSubmit}
            isLoading={isLoading}
            customStyles={{
              textbox: styles.textbox,
              textboxError: styles.textboxError,
              errorText: styles.errorText,
            }}
          />
        </div>
      )}
    </AuthContainer>
  );
}
