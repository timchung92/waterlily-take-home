import { useDispatch, useSelector } from 'react-redux';
import { CurrencyInput } from '..';
import {
  selectClient,
  putClientCareEnvironmentCostsForClientByClientIdRequest,
} from '../model';
import { FormErrorAlert } from './FormErrorAlert';
import { CareEnvironment, careEnvironmentDefs, formatCurrency } from '@shared';
import { useEffect, useState } from 'react';
import {
  getRateLocaleType,
  localCareEnvironmentRates,
} from '@shared/localCareEnvironmentRates';
import { Modal } from './Modal';

interface CareSettingCostModalProps {
  selectedCareEnvironment: CareEnvironment;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ErrorMessage = ({ message }: { message?: string }) => {
  if (!message) {
    return null;
  } else {
    return <p className="ml-2 text-sm text-red-400">{message}</p>;
  }
};

export default function CareEnvironmentCostModal({
  selectedCareEnvironment,
  open,
  setOpen,
}: CareSettingCostModalProps) {
  const client = useSelector(selectClient);
  const dispatch = useDispatch();
  const {
    careEnvironmentCosts,
    intakeSurvey: { clientLtcZipCode },
  } = client;

  const requiredKeys: CareEnvironment[] = [];

  const [careEnvironmentCostsState, setCareEnvironmentCostsState] =
    useState<CareEnvironmentCosts>(careEnvironmentCosts ?? {});

  const [formErrors, setFormErrors] = useState(
    {} as Record<CareEnvironment, string>,
  );
  const [formHasBeenSubmitted, setFormHasBeenSubmitted] = useState(false);

  const zipCodeRateData = localCareEnvironmentRates(
    clientLtcZipCode,
    selectedCareEnvironment,
  );
  const rateLocaleType = getRateLocaleType(clientLtcZipCode);
  const useLocalRate = rateLocaleType === 'Local' || rateLocaleType === 'State';

  const handleChangeCareEnvironmentCosts = (value: number) => {
    setCareEnvironmentCostsState(prevCareEnvironmentCostsState => {
      return {
        ...prevCareEnvironmentCostsState,
        [selectedCareEnvironment]: value,
      };
    });
  };

  const validateForm = () => {
    let isFormValid = true;

    const errors = {} as Record<CareEnvironment, string>;
    requiredKeys.forEach(key => {
      if (!careEnvironmentCostsState[key]) {
        errors[key] = 'Required Field';
      }
    });
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      isFormValid = false;
    }
    return isFormValid;
  };

  const handleClickSubmit = () => {
    setFormHasBeenSubmitted(true);
    const isFormValid = validateForm();
    if (!isFormValid) {
      return;
    }
    console.log(careEnvironmentCostsState);
    dispatch(
      putClientCareEnvironmentCostsForClientByClientIdRequest({
        clientId: client.clientId,
        careEnvironmentCosts: careEnvironmentCostsState,
      }),
    );
    setOpen(false);
  };

  const formIsValid = Object.keys(formErrors).length === 0;
  const hasRequiredFieldsErrors = Object.keys(formErrors).some(key =>
    requiredKeys.includes(key as unknown as CareEnvironment),
  );

  const resetForm = () => {
    setCareEnvironmentCostsState(careEnvironmentCosts ?? {});
    setFormErrors({} as Record<CareEnvironment, string>);
  };

  const onClose = () => {
    setOpen(false);
    resetForm();
  };

  useEffect(() => {
    if (formHasBeenSubmitted) {
      validateForm();
    }
  }, [careEnvironmentCostsState]);

  useEffect(() => {
    if (open) {
      setCareEnvironmentCostsState(careEnvironmentCosts ?? {});
      setFormHasBeenSubmitted(false);
    }
  }, [open]);

  const modalContent = (
    <>
      <div className="relative pb-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-1 py-7">
          <div className="col-start-1 col-end-3 flex flex-col gap-2 pb-4">
            <h4 className="text-lg text-gray-900">Cost in your area</h4>
            <p className="text-sm text-gray-700 md:text-base">
              The median cost in {useLocalRate ? 'your area' : 'the US'} is{' '}
              {formatCurrency(zipCodeRateData.rateAmount)}/
              {selectedCareEnvironment === CareEnvironment.home
                ? 'hr'
                : 'month'}
              . If this field is left blank, we will use the median cost.
            </p>
          </div>
          <div>
            <CurrencyInput
              label={
                selectedCareEnvironment === CareEnvironment.home
                  ? 'CUSTOM HOURLY RATE'
                  : 'CUSTOM MONTHLY RATE'
              }
              unit={
                selectedCareEnvironment === CareEnvironment.home
                  ? 'per hour'
                  : 'per month'
              }
              placeholder="Enter dollars"
              value={careEnvironmentCostsState[selectedCareEnvironment] ?? null}
              onChange={handleChangeCareEnvironmentCosts}
            />
            <ErrorMessage message={formErrors[selectedCareEnvironment]} />
          </div>
        </div>
      </div>
      {!formIsValid && (
        <FormErrorAlert mainErrorMessage="There is an error with your submission">
          {hasRequiredFieldsErrors && (
            <li>
              <span className="font-bold">Required field:</span> Please fill out
              all required fields.
            </li>
          )}
        </FormErrorAlert>
      )}
      <div className="mt-5 flex flex-row-reverse">
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md bg-darkPurple px-12 py-2 text-lg font-semibold text-white shadow-sm hover:bg-darkPurple sm:ml-3 sm:w-auto"
          onClick={handleClickSubmit}
        >
          Save
        </button>
      </div>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit ${careEnvironmentDefs[selectedCareEnvironment].label} Cost`}
      subTitle=""
      width="md"
    >
      {modalContent}
    </Modal>
  );
}
