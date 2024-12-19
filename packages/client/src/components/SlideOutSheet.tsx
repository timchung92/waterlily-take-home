import { Fragment, useState } from 'react';
import { Dialog, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { isDefined } from '@shared';

interface SlideOutSheetProps {
  slideOutContent?: JSX.Element;
  maxWidth?: string;
  title: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export function SlideOutSheet(
  props: React.PropsWithChildren<SlideOutSheetProps>,
) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Button to open slide-out */}
      <button
        type="button"
        onClick={() => setOpen(true)}
      >
        {props.children}
        <span className="sr-only">Learn more</span>
      </button>
      <Transition.Root
        show={isDefined(props.open) ? props.open : open}
        as={Fragment}
      >
        <Dialog
          as="div"
          className="relative z-50"
          onClose={setOpen}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <TransitionChild
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel
                    className={`pointer-events-auto relative w-screen ${props.maxWidth ?? 'max-w-md'}`}
                  >
                    <div className="flex h-full flex-col overflow-y-scroll bg-white pb-16 shadow-xl">
                      <div className="flex justify-between border-b border-gray-200 px-8 py-5 text-2xl font-normal text-darkPurple shadow-sm md:text-3xl">
                        {/* Title */}
                        <div>
                          <span className="font-semibold">Waterlily</span>{' '}
                          {props.title}
                        </div>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 "
                            onClick={() =>
                              props.setOpen
                                ? props.setOpen(false)
                                : setOpen(false)
                            }
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon
                              className="h-7 w-7"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </div>
                      <div className="mt-[10vh] flex flex-col justify-between gap-2 px-8 text-gray-800">
                        {props.slideOutContent}
                      </div>
                    </div>
                  </Dialog.Panel>
                </TransitionChild>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
