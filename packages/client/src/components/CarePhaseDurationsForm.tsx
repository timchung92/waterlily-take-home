import { useDispatch, useSelector } from 'react-redux';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  selectClient,
  putClientCarePhaseDurationSelectionForClientByClientIdRequest,
  selectClientUpdatesStatus,
  resetClientUpdatesStatus,
} from '../model';
import {
  CarePhase,
  CarePhaseDef,
  carePhaseDefList,
  carePhaseDefs,
} from '@shared';
import { useEffect } from 'react';
import {
  FormHeader,
  FormInput,
  PrimarySecondaryButtonContainer,
  SecondaryFormButton,
  SubmitButton,
} from './FormComponents';
import { Toast } from '..';

const carePhaseStringKey = (carePhase: CarePhase) =>
  carePhaseDefs[carePhase].key;

const carePhaseEnumKey = (carePhase: CarePhase) =>
  carePhaseDefs[carePhase].value;

type CarePhaseDurationFormFields = Record<
  CarePhaseDef['key'],
  number | null | undefined
>;

function convertCarePhaseDurationSelectionsToFormFields(
  carePhaseDurationSelections: CarePhaseDurationSelections,
) {
  return {
    [carePhaseStringKey(CarePhase.earlyCare)]:
      carePhaseDurationSelections[CarePhase.earlyCare],
    [carePhaseStringKey(CarePhase.moderateCare)]:
      carePhaseDurationSelections[CarePhase.moderateCare],
    [carePhaseStringKey(CarePhase.fullCare)]:
      carePhaseDurationSelections[CarePhase.fullCare],
  };
}

function convertFormFieldsToCarePhaseDurationSelections(
  formFields: CarePhaseDurationFormFields,
) {
  return {
    [carePhaseEnumKey(CarePhase.earlyCare)]:
      formFields[carePhaseStringKey(CarePhase.earlyCare)],
    [carePhaseEnumKey(CarePhase.moderateCare)]:
      formFields[carePhaseStringKey(CarePhase.moderateCare)],
    [carePhaseEnumKey(CarePhase.fullCare)]:
      formFields[carePhaseStringKey(CarePhase.fullCare)],
  };
}

const careDurationSchema = z
  .number()
  .int() // Ensures it's an integer
  .min(0) // Minimum value is 0
  .nonnegative(); // Additional safety to ensure it's non-negative

type CarePhaseDurationsFormProps = {
  open: boolean;
};

export function CarePhaseDurationsForm({ open }: CarePhaseDurationsFormProps) {
  const client = useSelector(selectClient);
  const dispatch = useDispatch();

  const schema = z.object({
    [carePhaseStringKey(CarePhase.earlyCare)]: careDurationSchema,
    [carePhaseStringKey(CarePhase.moderateCare)]: careDurationSchema,
    [carePhaseStringKey(CarePhase.fullCare)]: careDurationSchema,
  });

  const {
    carePhaseDurationSelections,
    appliedInferenceSet: { ltcDurationYears },
    phaseCosts,
    intakeSurvey: { clientCurrentCarePhase },
  } = client;

  const clientUpdatesStatus = useSelector(
    selectClientUpdatesStatus,
  ).phaseDurations;
  const currentCarePhaseIndex =
    carePhaseDefList.findIndex(
      carePhaseDef => carePhaseDef.value === clientCurrentCarePhase,
    ) ?? -1;
  const isPastPhase = (phaseIndex: number) =>
    phaseIndex < currentCarePhaseIndex;
  const clientCarePhaseDurationSelections =
    convertCarePhaseDurationSelectionsToFormFields(carePhaseDurationSelections);
  const predictedDuration = (carePhaseDef: CarePhaseDef) => {
    return Math.round(
      phaseCosts[carePhaseDef.index].phaseDurationRatio * ltcDurationYears * 12,
    );
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CarePhaseDurationFormFields>({
    // set past care phases to 0
    defaultValues: {
      ...clientCarePhaseDurationSelections,
      ...Object.fromEntries(
        carePhaseDefList
          .filter(carePhaseDef => isPastPhase(carePhaseDef.index))
          .map(carePhaseDef => [carePhaseDef.key, 0]),
      ),
    },
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<CarePhaseDurationFormFields> = data => {
    const newData = convertFormFieldsToCarePhaseDurationSelections(data);
    dispatch(
      putClientCarePhaseDurationSelectionForClientByClientIdRequest({
        clientId: client.clientId,
        carePhaseDurationSelections: newData,
      }),
    );
  };

  const handleResetToPredictions = () => {
    const predictedCarePhaseDurations = {} as CarePhaseDurationFormFields;
    carePhaseDefList.forEach(carePhaseDef => {
      const phaseDurationRatio =
        phaseCosts[carePhaseDef.index].phaseDurationRatio;
      const phaseCareMonthsPredicted = Math.round(
        ltcDurationYears * phaseDurationRatio * 12,
      );
      predictedCarePhaseDurations[carePhaseDef.key] = isPastPhase(
        carePhaseDef.index,
      )
        ? 0
        : phaseCareMonthsPredicted;
    });
    reset(predictedCarePhaseDurations);
  };

  const resetState = () => {
    dispatch(resetClientUpdatesStatus('phaseDurations'));
    reset(clientCarePhaseDurationSelections);
  };

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open]);

  // after saving, reset the form state after 2 seconds so users can edit again
  useEffect(() => {
    if (clientUpdatesStatus === 'complete') {
      const timer = setTimeout(() => {
        resetState();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [clientUpdatesStatus]);

  return (
    <>
      <FormHeader title="How long will care last?" />
      <form onSubmit={handleSubmit(onSubmit)}>
        {carePhaseDefList.map(carePhaseDef => {
          return (
            <div
              key={carePhaseDef.key}
              className={`py-1 ${isPastPhase(carePhaseDef.index) ? 'hidden' : ''}`}
            >
              <FormInput
                label={`${carePhaseDef.label} (predicted ${predictedDuration(carePhaseDef)} months)`}
                id={carePhaseDef.key}
                type="number"
                placeholder={'Enter duration'}
                error={errors[carePhaseDef.key]}
                register={register(carePhaseDef.key, { valueAsNumber: true })}
                unit="months"
                className="w-3/4"
                required={true}
              />
            </div>
          );
        })}
        <PrimarySecondaryButtonContainer>
          <SubmitButton
            label="Save"
            disabled={clientUpdatesStatus === 'loading'}
            isLoading={clientUpdatesStatus === 'loading'}
            complete={clientUpdatesStatus === 'complete'}
            completeText="Saved"
            className=""
          />
          <SecondaryFormButton
            label="Reset"
            onClick={() => handleResetToPredictions()}
          />
        </PrimarySecondaryButtonContainer>
      </form>
    </>
  );
}
