import { useEffect, useState } from 'react';
import {
  AuthInputTextField,
  Modal,
  ModalDoneButton,
  isValidEmailFormat,
  putPartnerLinkRequestEmailRequest,
  resetClientUpdatesStatus,
  selectClient,
  selectClientErrorMessage,
  selectClientUpdatesStatus,
  selectMaybeClientPartner,
  selectSession,
} from '..';
import { useDispatch, useSelector } from 'react-redux';
import { isNullOrUndefined, SessionType } from '@shared';

type SendPartnerLinkRequestModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SendPartnerLinkRequestModal({
  open,
  onClose,
}: SendPartnerLinkRequestModalProps) {
  const client = useSelector(selectClient);
  const {
    clientEmail,
    clientId,
    advisorId,
    clientFirstName,
    clientLastName,
    clientFullName,
  } = client;
  const clientPartner = useSelector(selectMaybeClientPartner);
  const { sessionType } = useSelector(selectSession);
  const status = useSelector(selectClientUpdatesStatus).partnerLinkRequest;
  const errorMessageFromResponse = useSelector(selectClientErrorMessage);
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [email, setEmail] = useState('');
  const invalidEmailErrorMessage = 'Please enter a valid email address.';

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const handleSubmit = () => {
    const validEmailFormat = isValidEmailFormat(email);
    if (!validEmailFormat) {
      setErrorMessage(invalidEmailErrorMessage);
      return;
    } else {
      setErrorMessage('');
    }
    dispatch(
      putPartnerLinkRequestEmailRequest({
        partnerEmail: email,
        advisorId,
        clientId,
        clientEmail,
        clientFirstName,
        clientLastName,
      }),
    );
  };

  useEffect(() => {
    if (open) {
      setEmail('');
      setErrorMessage('');
      dispatch(resetClientUpdatesStatus('partnerLinkRequest'));
    }
  }, [open]);

  const renderContent = () => {
    if (sessionType === SessionType.advisor) {
      return (
        <p className="py-4 text-base text-gray-600">
          As an advisor, you can create or edit partner links directly from your
          client's dashboard. No request or approval needed.
        </p>
      );
    }
    if (!isNullOrUndefined(clientPartner)) {
      return (
        <p className="py-4 text-base text-gray-600">
          {clientFullName} is currently linked with{' '}
          {clientPartner.clientFullName}. To update this, please reach out to
          your advisor.
        </p>
      );
    }
    return (
      <div className="mt-4 ">
        <AuthInputTextField
          label="Partner email"
          value={email}
          onChange={handleEmailChange}
          placeholder="Enter email"
          error={errorMessage === invalidEmailErrorMessage}
          id="email"
        />
        <ModalDoneButton
          className="mt-2"
          buttonText="Send"
          onClick={handleSubmit}
        />
      </div>
    );
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Send Link Request"
        subTitle="Send a request to your partner to link accounts."
        width="md"
        errorMessage={
          status === 'error'
            ? (errorMessageFromResponse ??
              'There was an error sending the request link. Please try again or contact support.')
            : errorMessage
        }
        showSuccess={status === 'complete'}
        isLoading={status === 'loading'}
        successMessage="Request link successfully sent!"
      >
        {renderContent()}
      </Modal>
    </>
  );
}
