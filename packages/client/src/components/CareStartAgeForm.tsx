import { useDispatch, useSelector } from 'react-redux';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  selectClient,
  putClientCustomInferencesForClientByClientIdRequest,
  resetClientUpdatesStatus,
  selectClientUpdatesStatus,
} from '../model';
import { useEffect } from 'react';
import {
  FormHeader,
  FormInput,
  PrimarySecondaryButtonContainer,
  SecondaryFormButton,
  SubmitButton,
} from './FormComponents';
import { Toast } from '..';

type CareStartAgeFields = Record<'ltcAtAge', number | null | undefined>;

const ltcAtAgeValidation = z
  .number()
  .int() // Ensures it's an integer
  .min(0) // Minimum value is 0
  .nonnegative(); // Additional safety to ensure it's non-negative

type CareStartAgeFormProps = {
  open: boolean;
};

export function CareStartAgeForm({ open }: CareStartAgeFormProps) {
  const client = useSelector(selectClient);
  const clientStatus = useSelector(selectClientUpdatesStatus).ltcAtAge;
  const {
    intakeSurvey: { clientHasStartedLtc },
  } = client;

  const {
    clientCustomInferences: { ltcAtAge },
  } = client;
  const dispatch = useDispatch();

  const schema = z.object({
    ltcAtAge: ltcAtAgeValidation,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CareStartAgeFields>({
    defaultValues: { ltcAtAge },
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<CareStartAgeFields> = data => {
    dispatch(
      putClientCustomInferencesForClientByClientIdRequest({
        clientId: client.clientId,
        clientCustomInferences: data as Partial<ClientCustomInferences>,
      }),
    );
  };

  const resetState = () => {
    dispatch(resetClientUpdatesStatus('ltcAtAge'));
    setValue('ltcAtAge', client.appliedInferenceSet.ltcAtAge);
  };

  const handleResetToPrediction = () => {
    setValue('ltcAtAge', client.inferenceSet.ltcAtAge);
  };

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open]);

  return (
    <>
      <FormHeader title="When will care start?" />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="py-1"
      >
        <FormInput
          label={`Start Age ${clientHasStartedLtc ? `(according to intake form ${client.inferenceSet.ltcAtAge})` : `(predicted ${client.inferenceSet.ltcAtAge})`}`}
          id={`ltcAtAge`}
          type="number"
          placeholder={'Enter age'}
          error={errors['ltcAtAge']}
          register={register('ltcAtAge', { valueAsNumber: true })}
          unit="years old"
          className="w-3/4"
          min={50}
          max={150}
          required={true}
          disabled={clientHasStartedLtc}
          helperText={
            clientHasStartedLtc
              ? 'Disabled because client already started long-term care'
              : ''
          }
        />
        <PrimarySecondaryButtonContainer>
          {!clientHasStartedLtc && (
            <>
              <SubmitButton
                label="Save"
                disabled={clientStatus === 'loading'}
                isLoading={clientStatus === 'loading'}
                complete={clientStatus === 'complete'}
                completeText="Saved"
                className=""
              />
              <SecondaryFormButton
                label="Reset"
                onClick={() => handleResetToPrediction()}
              />
            </>
          )}
        </PrimarySecondaryButtonContainer>
      </form>
      <Toast
        show={clientStatus === 'complete'}
        onClose={() => resetState()}
        autoCloseDuration={2000}
        title="Care Start Age Saved"
        message="Your changes have been saved"
      />
    </>
  );
}
