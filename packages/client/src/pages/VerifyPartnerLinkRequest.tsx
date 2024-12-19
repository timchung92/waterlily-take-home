import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import {
  clearVerifyPartnerLinkRequest,
  fetchPartnerLinkRequestRecordByTokenForPublicRequest,
  postVerifySecurityQuestionsPartnerLinkForClientByClientIdRequest,
  selectVerifyPartnerLinkRequestState,
  setClientSessionType,
} from '../model';
import { MdCheckCircle } from 'react-icons/md';

import { useEffect, useRef } from 'react';
import mainStyles from '../styles/main.module.css';
import magicLinkStyles from './VerifyMagicLink.module.css';
import { AuthContainer, AuthSuccessMessage, FormErrorAlert } from '..';

import {
  SecurityVerificationForm,
  SecurityVerificationFormValues,
} from '@/components/SecurityVerificationForm';
import { TriangleAlert } from 'lucide-react';

const styles = {
  ...mainStyles,
  ...magicLinkStyles,
};

export function VerifyPartnerLinkRequest() {
  const { token } = useParams<{ token: string }>();
  const { status, errorMessage, dbRecord } = useSelector(
    selectVerifyPartnerLinkRequestState,
  );
  const initialFetchDone = useRef(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // Only fetch the initial session once when component mounts
    dispatch(clearVerifyPartnerLinkRequest());
    if (token && !initialFetchDone.current) {
      dispatch(fetchPartnerLinkRequestRecordByTokenForPublicRequest(token));
      dispatch(setClientSessionType());
    }
  }, [dispatch, token]);

  const handleVerificationSubmit = (values: SecurityVerificationFormValues) => {
    if (
      !dbRecord ||
      !dbRecord.partnerClientId ||
      !dbRecord.partnerLinkRequestId
    ) {
      return;
    }
    dispatch(
      postVerifySecurityQuestionsPartnerLinkForClientByClientIdRequest({
        clientId: dbRecord.partnerClientId,
        dateOfBirth: values.dateOfBirth,
        zipCode: values.zipCode,
        height: values.height?.value ?? '',
        partnerLinkRequestId: dbRecord.partnerLinkRequestId,
      }),
    );
  };

  const renderContent = () => {
    switch (status) {
      case 'verified':
        return (
          <AuthSuccessMessage
            title="Accounts Successfully Linked"
            message="Great news! Your accounts are now connected. We'll notify your partner about the successful link."
          />
        );

      case 'locked':
        return (
          <div className="flex max-w-xl flex-col gap-2 px-2">
            <h2 className="flex items-center gap-3 text-xl font-normal text-gray-900 md:text-2xl">
              <TriangleAlert className="text-yellow-500" />
              Verification Paused
            </h2>
            <p className="py-2 text-base text-gray-600 md:text-lg">
              Security is important to us. You've exceeded the maximum number of
              verification attempts. Please contact our support team for help,
              or ask your partner to send a new link request.
            </p>
          </div>
        );

      case 'expired':
        return (
          <div className="flex max-w-xl flex-col gap-2 px-2">
            <h2 className="flex items-center gap-3 text-xl font-normal text-gray-900 md:text-2xl">
              <TriangleAlert className="text-yellow-500" />
              Link Expired
            </h2>
            <p className="py-2 text-base text-gray-600 md:text-lg">
              This verification link has expired. Please ask your partner to
              send a new link request.
            </p>
          </div>
        );

      case 'invalidToken':
        return (
          <div className="flex max-w-xl flex-col gap-2 px-2">
            <h2 className="flex items-center gap-3 text-xl font-normal text-gray-900 md:text-2xl">
              <TriangleAlert className="text-yellow-500" />
              Invalid Link
            </h2>
            <p className="py-2 text-base text-gray-600 md:text-lg">
              This verification link is invalid. Please make sure you're using
              the correct link or ask your partner to send a new one.
            </p>
          </div>
        );

      default:
        return (
          <div className="max-w-xl px-3">
            <h2 className="text-xl font-normal text-gray-900">
              Security Questions
            </h2>
            <div className="mb-4 mt-1 text-base text-gray-500">
              Please answer the following security questions to establish the
              requested partner link.
            </div>
            <SecurityVerificationForm
              onSubmit={handleVerificationSubmit}
              isLoading={status === 'loading'}
              customStyles={{
                textbox: styles.textbox,
                textboxError: styles.textboxError,
                errorText: styles.errorText,
              }}
            />
            <FormErrorAlert
              mainErrorMessage={errorMessage ?? ''}
              className="my-4"
            />
          </div>
        );
    }
  };

  return (
    <AuthContainer
      title="Establish Partner Link"
      successState={status === 'verified'}
      isLoading={status === 'loading'}
      warningState={
        status === 'locked' || status === 'expired' || status === 'invalidToken'
      }
    >
      {renderContent()}
    </AuthContainer>
  );
}
