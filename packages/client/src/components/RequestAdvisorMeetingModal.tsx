import { useEffect, useState } from 'react';
import {
  AuthInputDisabledField,
  Modal,
  ModalDoneButton,
  ModalFormSubmitButton,
  REQUESTED_MEETING,
  postAdvisorMeetingRequestEmailRequest,
  putClientTagsByClientIdRequest,
  resetClientUpdatesStatus,
  selectClient,
  selectClientUpdatesStatus,
  selectSessionAdvisor,
} from '..';
import { TextareaAutosize } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

type RequestAdvisorMeetingModalProps = {
  open: boolean;
  onClose: () => void;
};

export function RequestAdvisorMeetingModal({
  open,
  onClose,
}: RequestAdvisorMeetingModalProps) {
  const [description, setDescription] = useState('');
  const clientStatus = useSelector(
    selectClientUpdatesStatus,
  ).advisorMeetingRequest;
  const { advisorEmail, advisorFirstName } = useSelector(selectSessionAdvisor);
  const { clientId, clientEmail, clientFullName, clientTags } =
    useSelector(selectClient);

  const dispatch = useDispatch();

  const handleSubmit = () => {
    dispatch(
      postAdvisorMeetingRequestEmailRequest({
        advisorEmail,
        advisorFirstName,
        clientProvidedBody: description,
        clientEmail,
        clientFullName,
      }),
    );
    const newTags = [...clientTags, REQUESTED_MEETING];
    dispatch(putClientTagsByClientIdRequest({ clientTags: newTags, clientId }));
  };

  const resetState = () => {
    dispatch(resetClientUpdatesStatus('advisorMeetingRequest'));
    setDescription('');
  };

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Request an Advisor Meeting"
      subTitle=""
      width="lg"
      showSuccess={clientStatus === 'complete'}
      successMessage="Your request has been sent!"
      isLoading={clientStatus === 'loading'}
      errorMessage={
        clientStatus === 'error'
          ? 'Error sending request. Please try again or contact support'
          : ''
      }
      primaryButton={
        <ModalDoneButton
          buttonText="Request Meeting"
          onClick={handleSubmit}
        />
      }
    >
      <form
        onSubmit={handleSubmit}
        className="mt-2 flex flex-col"
      >
        <AuthInputDisabledField
          label="Requester's email"
          value={clientEmail}
          id={'clientEmail'}
        />
        <p className="mt-4 text-sm font-medium leading-6 text-gray-900">
          Briefly describe what you'd like to discuss with your advisor.
        </p>
        <TextareaAutosize
          className="h-32 w-full rounded border border-gray-300 bg-white p-2 text-gray-700"
          placeholder="Enter message here (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          minRows={3}
        />
      </form>
    </Modal>
  );
}
