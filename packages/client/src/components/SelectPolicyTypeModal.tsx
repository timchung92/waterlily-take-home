import { useEffect, useState } from 'react';
import {
  ListboxDropDown,
  TextButton,
  checkIfHasJointPolicy,
  findOption,
  getApplicablePolicyTypes,
  selectClient,
  selectSessionAdvisor,
  yesNoBooleanOptions,
} from '..';
import {
  FundingPolicyTypeDef,
  fundingPolicyTypeDefs,
  isNullOrUndefined,
} from '@shared';
import { Modal, ModalDoneButton } from './Modal';
import { SearchResultsBar } from './SearchResultsBar';
import { Tooltip } from '@mui/material';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { useSelector } from 'react-redux';

type SelectFundingTypeModalProps = {
  open: boolean;
  setSelectedPolicyType: (policyType: FundingPolicyTypeDef['value']) => void;
  onClose: () => void;
};

export function SelectFundingTypeModal({
  open,
  setSelectedPolicyType,
  onClose,
}: SelectFundingTypeModalProps) {
  const applicablePolicyTypes = getApplicablePolicyTypes();
  const { multipleFundingSources } = useSelector(selectClient);
  const [selected, setSelected] = useState<
    FundingPolicyTypeDef['value'] | null
  >(null);
  const { mutableClientPartner } = useSelector(selectClient);
  const hasJointPolicy = checkIfHasJointPolicy(multipleFundingSources);

  const defaultJointPolicyOption =
    !isNullOrUndefined(mutableClientPartner) && !hasJointPolicy;
  const [selectedJointPolicyOption, setSelectedJointPolicyOption] = useState(
    findOption(yesNoBooleanOptions, defaultJointPolicyOption),
  );
  useEffect(() => {
    if (open) {
      setSelected(null);
      setSelectedJointPolicyOption(
        findOption(yesNoBooleanOptions, defaultJointPolicyOption),
      );
    }
  }, [open]);

  const policyTypeOptions = applicablePolicyTypes.filter(
    def =>
      !def.isGeneric &&
      (selectedJointPolicyOption.value ? def.isJoint : !def.isJoint),
  );
  const genericPolicyTypeOptions = applicablePolicyTypes.filter(
    def =>
      def.isGeneric &&
      (selectedJointPolicyOption.value ? def.isJoint : !def.isJoint),
  );

  const createSearchLabel = (policyType: FundingPolicyTypeDef) =>
    `${policyType.carrier ?? ''} ${policyType.label}`;
  const createDescription = (policyType: FundingPolicyTypeDef) =>
    policyType.description;

  const selectedPolicyIsNotGeneric =
    selected && !fundingPolicyTypeDefs[selected].isGeneric;

  const advisor = useSelector(selectSessionAdvisor);
  const { advisorId, advisorEmail, organizationDisplayName } = advisor;
  const requestFormBaseUrl = 'https://waterlily.typeform.com/to/YSsEMouO';
  const requestFormUrl = `${requestFormBaseUrl}#advisor_id=${encodeURIComponent(advisorId)}&advisor_email=${encodeURIComponent(advisorEmail)}&advisor_organization=${organizationDisplayName ? encodeURIComponent(organizationDisplayName) : ''}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Select your policy"
      subTitle="Search your policy's name"
      primaryButton={
        <ModalDoneButton
          buttonText="Create policy"
          onClick={() => {
            if (selected) {
              setSelectedPolicyType(selected);
              onClose();
            }
          }}
          disabled={!selected}
        />
      }
    >
      {!selected && mutableClientPartner && (
        <div className="mt-4">
          <ListboxDropDown<boolean>
            label={
              <p>
                <span className="font-semibold">Joint benefits: </span>
                Does this policy provide coverage for both partners, either
                through shared benefits or separate benefit pools?
              </p>
            }
            selectedOption={selectedJointPolicyOption}
            setSelected={option =>
              setSelectedJointPolicyOption(
                findOption(yesNoBooleanOptions, option.value),
              )
            }
            options={yesNoBooleanOptions}
            disabled={hasJointPolicy}
          />
        </div>
      )}
      {hasJointPolicy && !selected && (
        <p className="ml-1 mt-1 text-xs text-gray-500">
          *Only one joint policy can be added at a time.
        </p>
      )}
      {!selected && (
        <SearchResultsBar
          handleSelect={policyTypeDef => setSelected(policyTypeDef.value)}
          options={policyTypeOptions}
          createSearchLabel={createSearchLabel}
          createDescription={createDescription}
          searchTypeName="policy name (e.g., OneAmerica Asset Care)"
          className="my-8"
          defaultOptions={genericPolicyTypeOptions}
          defaultOptionsText={`No matching policy name found. Consider using a generic type.`}
        />
      )}
      {selected && (
        <div className="my-8 flex items-center justify-between gap-x-6 pb-5 pt-3 ">
          <div className="flex min-w-0 gap-x-4">
            <div className="my-1 min-w-0 flex-auto">
              <p className="text-base font-medium leading-6 text-gray-900 sm:text-lg">
                {createSearchLabel(fundingPolicyTypeDefs[selected])}
              </p>
              <p className="truncate text-sm leading-5 text-gray-500 sm:text-base">
                {createDescription(fundingPolicyTypeDefs[selected])}
              </p>
            </div>
          </div>
          <Tooltip title={<p className="text-sm">Remove</p>}>
            <button
              onClick={() => setSelected(null)}
              className="rounded-md px-1 py-1 font-semibold text-gray-500 hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </Tooltip>
        </div>
      )}
      {!selectedPolicyIsNotGeneric && (
        <TextButton
          className="ml-auto mt-4 text-sm"
          buttonLabel="Not seeing your policy? Request it here"
          href={requestFormUrl}
        />
      )}
    </Modal>
  );
}
