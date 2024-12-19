import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';
import { FormErrorAlert, cn } from '..';
import { useEffect } from 'react';
import { LoadingState } from './LoadingState';
import { Transition } from '@headlessui/react';
import { Button } from './ui/button';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subTitle: string;
  isLoading?: boolean;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
  showSuccess?: boolean;
  successMessage?: string;
  errorMessage?: string;
  primaryButton?: React.ReactNode;
};

export function Modal({
  open,
  onClose,
  title,
  subTitle,
  isLoading,
  children,
  width,
  showSuccess,
  successMessage,
  errorMessage,
  primaryButton,
}: ModalProps) {
  const widthMap = {
    sm: 'sm:max-w-[450px]',
    md: 'sm:max-w-[550px]',
    lg: 'sm:max-w-[650px]',
  };
  const widthCode = width ? widthMap[width] : 'sm:max-w-[650px]';

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, onClose]);

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent
        className={cn(
          'my-12 max-h-[750px] overflow-auto py-12 pb-24 sm:my-0 md:py-8',
          widthCode,
          showSuccess ? 'border-t-4 border-green-600' : '',
        )}
      >
        <div className={`${!showSuccess ? '' : 'hidden'}`}>
          <DialogHeader className="text-left">
            <DialogTitle className=" text-xl font-semibold text-darkPurple md:text-2xl">
              {title}
            </DialogTitle>
            {subTitle && (
              <p className="text-sm text-gray-500 md:text-base">{subTitle}</p>
            )}
          </DialogHeader>
          {children}
        </div>

        <LoadingState isLoading={isLoading} />

        {errorMessage && (
          <FormErrorAlert
            mainErrorMessage={errorMessage}
            className="mt-4"
          />
        )}

        <SuccessMessage
          show={showSuccess === true}
          successMessage={successMessage}
        />
        {primaryButton && !showSuccess && (
          <DialogFooter>{primaryButton}</DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

type ModalButtonProps = {
  disabled?: boolean;
  className?: string;
  buttonText: string | React.ReactNode;
};

type ModalDoneButtonProps = ModalButtonProps & {
  onClick: () => void;
};

const modalButtonClassName = `transition-color bottom-8 inline-flex w-full justify-center rounded-md font-semibold text-white sm:ml-3 sm:w-auto `;

export function ModalDoneButton({
  disabled,
  buttonText,
  onClick,
  className,
}: ModalDoneButtonProps) {
  return (
    <div className="mt-6 flex w-full justify-end">
      <Button
        disabled={disabled}
        className={cn(modalButtonClassName, className)}
        onClick={onClick}
      >
        {buttonText}
      </Button>
    </div>
  );
}

export function ModalFormSubmitButton({
  disabled,
  buttonText,
  className,
}: ModalButtonProps) {
  return (
    <div className="mt-6 flex w-full justify-end">
      <Button
        disabled={disabled}
        className={cn(modalButtonClassName, className)}
        type="submit"
      >
        {buttonText}
      </Button>
    </div>
  );
}

function SuccessMessage({
  show,
  successMessage,
}: {
  show?: boolean;
  successMessage?: string;
}) {
  return (
    <Transition
      show={show}
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      enterTo="opacity-100 translate-y-0 sm:scale-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100 translate-y-0 sm:scale-100"
      leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    >
      <div className="h-45 flex items-center justify-center bg-opacity-40">
        <div className="flex flex-col items-center justify-center rounded-lg bg-white p-10">
          <div className="flex items-center justify-center rounded-full border-8 border-green-100 bg-green-500 p-3 text-white">
            <CheckIcon
              className="h-6 w-6 "
              aria-hidden="true"
            />
          </div>
          <div className="mt-5 text-center">
            <DialogTitle className="text-xl font-semibold leading-6 text-darkPurple">
              Success
            </DialogTitle>
            <p className="mt-1 text-base text-gray-500">{successMessage}</p>
          </div>
        </div>
      </div>
    </Transition>
  );
}
