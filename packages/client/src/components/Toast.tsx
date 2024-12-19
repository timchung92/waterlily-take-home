import { Transition } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef } from 'react';

type ToastProps = {
  show: boolean;
  onClose: () => void;
  title: string;
  autoCloseDuration?: number; // Optional duration for auto close (in milliseconds)
  message?: string;
};

export function Toast({
  show,
  onClose,
  title,
  message,
  autoCloseDuration = 3000,
}: ToastProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (show) {
      // Set a timer to automatically close the toast after the duration
      timerRef.current = setTimeout(() => {
        onClose();
      }, autoCloseDuration);

      // Clean up the timer if the component unmounts or `show` changes
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [show, onClose, autoCloseDuration]);

  return (
    <>
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:items-start sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          <Transition show={show}>
            <div className="pointer-events-auto w-full max-w-xs overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition data-[closed]:data-[enter]:translate-y-2 data-[enter]:transform data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:data-[enter]:sm:translate-x-2 data-[closed]:data-[enter]:sm:translate-y-0">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-green-400"
                    />
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">{title}</p>
                    {message && (
                      <p className="mt-1 text-sm text-gray-500">{message}</p>
                    )}
                  </div>
                  {/* <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon
                        aria-hidden="true"
                        className="h-5 w-5"
                      />
                    </button>
                  </div> */}
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
}
