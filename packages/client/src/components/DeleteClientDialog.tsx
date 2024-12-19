import { useDispatch, useSelector } from 'react-redux';
import { selectSessionAdvisor } from '../model/selectors';
import { deleteClientByClientIdRequest } from '..';
import { useRef } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Modal } from './Modal';

interface DeleteClientDialogProps {
  open: boolean;
  client: Client;
  onClose: () => void;
}

export function DeleteClientDialog(props: DeleteClientDialogProps) {
  const { open, onClose, client } = props;
  const cancelButtonRef = useRef(null);
  const advisor = useSelector(selectSessionAdvisor);
  const dispatch = useDispatch();

  function handleDeleteClient(clientId: string) {
    dispatch(
      deleteClientByClientIdRequest({ clientId, advisorId: advisor.advisorId }),
    );
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete account"
      width="sm"
      subTitle=""
      primaryButton={
        <div className="sm:flex sm:flex-row-reverse ">
          <button
            type="button"
            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
            onClick={() => handleDeleteClient(client.clientId)}
          >
            Delete
          </button>
          <button
            type="button"
            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            onClick={onClose}
            ref={cancelButtonRef}
          >
            Cancel
          </button>
        </div>
      }
    >
      <div className="my-5 sm:flex sm:items-start">
        <div className="mx-auto hidden h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10 md:flex ">
          <ExclamationTriangleIcon
            className="h-6 w-6 text-red-600"
            aria-hidden="true"
          />
        </div>
        <div className="mt-3 sm:ml-4 sm:mt-0 sm:text-left">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete {client.clientFirstName}{' '}
            {client.clientLastName}? All of their data will be permanently
            removed from our servers forever. This action cannot be undone.
          </p>
        </div>
      </div>
    </Modal>
  );
}
