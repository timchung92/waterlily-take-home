import { useEffect, useState } from 'react';
import {
  AuthInputTextField,
  Modal,
  ModalDoneButton,
  isValidEmailFormat,
  putMagicLinkEmailToClientRequest,
  resetAdvisorUpdatesStatus,
  selectAdvisorUpdatesStatus,
} from '..';
import { useDispatch, useSelector } from 'react-redux';

type SendResultsLinkModalProps = {
  client: Client;
  open: boolean;
  onClose: () => void;
};

export function SendResultsLinkModal({
  client,
  open,
  onClose,
}: SendResultsLinkModalProps) {
  const { clientEmail, clientId } = client;
  const status = useSelector(selectAdvisorUpdatesStatus).sendMagicLink;
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [email, setEmail] = useState(clientEmail);
  const invalidEmailErrorMessage = 'Please enter a valid email address.';

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const handleSubmit = () => {
    if (!isValidEmailFormat(email)) {
      setErrorMessage(invalidEmailErrorMessage);
      return;
    } else {
      setErrorMessage('');
    }

    dispatch(putMagicLinkEmailToClientRequest({ clientId, email }));
  };

  useEffect(() => {
    if (open) {
      setEmail(clientEmail || '');
      setErrorMessage('');
      dispatch(resetAdvisorUpdatesStatus('sendMagicLink'));
    }
  }, [open]);

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Send Results Link"
        subTitle="Give client a one-time link to view their results."
        width="md"
        errorMessage={
          status === 'error'
            ? 'There was an error sending the results link. Please try again or contact support.'
            : status === 'unsubscribed'
              ? 'The email address you entered is unsubscribed from transaction emails. Please enter a different email address.'
              : errorMessage
        }
        showSuccess={status === 'complete'}
        isLoading={status === 'loading'}
        successMessage="Results link successfully sent!"
        primaryButton={
          clientEmail ? (
            <ModalDoneButton
              buttonText="Send"
              onClick={handleSubmit}
            />
          ) : undefined
        }
      >
        <div className="my-4 ">
          {!clientEmail ? (
            <p className="text-base text-gray-600">
              This feauture is currently unavailable for clients without an
              email on file. Please contact support for assistance.
            </p>
          ) : (
            <AuthInputTextField
              label="Recipient email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter email"
              error={errorMessage === invalidEmailErrorMessage}
              id="email"
            />
          )}
        </div>
      </Modal>
    </>
  );
}
