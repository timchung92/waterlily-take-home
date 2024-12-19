import { FundingPolicyType, fundingPolicyTypeDefList } from '@shared';
import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';

interface AddAnnuityButtonProps {
  buttonClassName?: string;
  buttonChildren?: React.ReactNode;
  annuityTypeSelectHandler: (policyType: FundingPolicyType) => void;
}

export function AddAnnuityButton(props: AddAnnuityButtonProps) {
  return (
    <>
      <Popover className="relative">
        <Popover.Button className={props.buttonClassName}>
          {props.buttonChildren ?? null}
        </Popover.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel className="absolute left-2/3 z-10 mt-4 flex w-screen max-w-min -translate-x-1/2 px-4">
            <div className="w-56 shrink rounded-xl bg-white p-2 text-base font-semibold leading-6 text-gray-900 shadow-lg ring-1 ring-gray-900/5">
              {fundingPolicyTypeDefList.map(policyType => (
                <button
                  key={policyType.value}
                  className="block p-2 text-gray-700 hover:text-purple"
                  onClick={() =>
                    props.annuityTypeSelectHandler(policyType.value)
                  }
                >
                  {policyType.label}
                </button>
              ))}
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
    </>
  );
}
