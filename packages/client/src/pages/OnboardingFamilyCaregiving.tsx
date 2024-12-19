import { useDispatch, useSelector } from 'react-redux';
import {
  FamilyCareGivingSlideOutContent,
  FamilyCarePercentageSlideOutContent,
  SlideOutSheet,
  OnboardingChrome,
  ThousandsIntegerInput,
  CustomizePlanButtonGroup,
} from '../components';
import {
  previewClientUpdates,
  putSupportProviderSetForClientByClientIdRequest,
  selectClient,
  selectMaybeClientPartner,
  selectSupportProviderSet,
} from '../model';
import { SlideContent } from '../components/SlideContent';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import {
  carePhaseDefs,
  updateSupportProviderSet,
  CarePhase,
  SupportProviderType,
  formatThousands,
  fullName,
  calcClientPhaseStartYears,
} from '@shared';
import { CarePhaseCostSummary } from '../components/CarePhaseCostSummary';
import { Person as PersonIcon } from '@mui/icons-material';
import DomainAddSharpIcon from '@mui/icons-material/DomainAddSharp';
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';

import styles from './OnboardingFamilyCaregiving.module.css';

import classNames from 'classnames';
import produce from 'immer';
import { InputAdornment, Tooltip } from '@mui/material';
import { BsFillQuestionCircleFill } from 'react-icons/bs';

interface CarePhaseProps {
  carePhase: CarePhase;
  slidePage: FunctionComponent<ClientIdProps>;
}

function OnboardingFamilyCaregiving({ carePhase, slidePage }: CarePhaseProps) {
  const client = useSelector(selectClient)!;
  const {
    clientFirstName,
    intakeSurvey: { clientCurrentCarePhase },
  } = client;

  const carePhaseIndex = carePhaseDefs[carePhase].index;
  const phaseCosts = client.phaseCosts[carePhaseIndex];
  const clientPartner = useSelector(selectMaybeClientPartner);
  const doesPartnerCareOverlap = isPartnerCareGivingOverlapping(
    client,
    clientPartner,
    carePhase,
    client.supportProviderSet,
  );

  return (
    <OnboardingChrome
      slidePage={slidePage}
      nextButtonLabel={
        carePhaseIndex === 2 // check if last phase
          ? `Review Full Cost Summary`
          : `Go to ${carePhaseDefs[carePhase + 1].label}`
      }
    >
      <SlideContent
        headerText={
          <>
            Family involvement in{' '}
            <span className="text-purple">
              {carePhaseDefs[carePhase].label}
            </span>
          </>
        }
        headerSubText={
          <div className="text-lg">
            Edit the commitment of{' '}
            {clientCurrentCarePhase === carePhase ? 'remaining' : ''} care
            hours, totaling {formatThousands(phaseCosts.phaseCareHoursNeeded)}{' '}
            hours over {phaseCosts.phaseCareMonthsNeeded}{' '}
            <span className="whitespace-nowrap">
              months.
              <SlideOutSheet
                slideOutContent={<FamilyCareGivingSlideOutContent />}
                title="AI"
              >
                <BsFillQuestionCircleFill
                  className="h-4 w-4 -translate-y-1 pl-1 text-gray-400 hover:text-gray-500 md:h-5 md:w-5"
                  aria-hidden="true"
                />
              </SlideOutSheet>
            </span>
          </div>
        }
      >
        <CustomizePlanButtonGroup
          client={client}
          className="my-5"
          showDisqualifyingConditionsBtn={false}
        />
        <div className="mb-8 flex flex-col gap-8 md:mt-8 md:flex-row md:gap-16">
          <div className="">
            <SupportProviderBoxes carePhase={carePhase} />
          </div>
          <div className="h-full basis-1/2">
            <CarePhaseCostSummary
              client={client}
              carePhase={carePhase}
            />
            {
              // show warning if partner care is overlapping
              doesPartnerCareOverlap && (
                <div className="my-4">
                  <PartnerCareOverlapWarning
                    clientPartner={clientPartner!}
                    client={client}
                    phaseCareMonthsNeeded={phaseCosts.phaseCareMonthsNeeded}
                    overlapMonths={calcCareOverlapWithPartner(
                      client,
                      clientPartner!,
                      carePhase,
                    )}
                  />
                </div>
              )
            }
          </div>
        </div>
      </SlideContent>
    </OnboardingChrome>
  );
}

export function OnboardingFamilyCaregivingPhaseOne({
  clientId,
}: ClientIdProps) {
  return (
    <OnboardingFamilyCaregiving
      carePhase={carePhaseDefs.earlyCare.value}
      slidePage={OnboardingFamilyCaregivingPhaseOne}
    />
  );
}

export function OnboardingFamilyCaregivingPhaseTwo({
  clientId,
}: ClientIdProps) {
  return (
    <OnboardingFamilyCaregiving
      carePhase={carePhaseDefs.moderateCare.value}
      slidePage={OnboardingFamilyCaregivingPhaseTwo}
    />
  );
}

export function OnboardingFamilyCaregivingPhaseThree({
  clientId,
}: ClientIdProps) {
  return (
    <OnboardingFamilyCaregiving
      carePhase={carePhaseDefs.fullCare.value}
      slidePage={OnboardingFamilyCaregivingPhaseThree}
    />
  );
}

const formattedPersonIcon = (
  <PersonIcon
    fontSize="small"
    sx={{ paddingBottom: '3px', color: '#382377' }}
  />
);
const iconMapping = {
  'Children': formattedPersonIcon,
  'Other Family': formattedPersonIcon,
  'Professional Care Service': (
    <DomainAddSharpIcon
      fontSize="small"
      sx={{ paddingBottom: '3px' }}
    />
  ),
};

function getIconByName(name: string) {
  const icon = iconMapping[name as keyof typeof iconMapping];
  return icon ?? formattedPersonIcon;
}
interface SupportProviderBoxesProps {
  carePhase: CarePhase;
}

function SupportProviderBoxes({ carePhase }: SupportProviderBoxesProps) {
  const client = useSelector(selectClient);

  const { clientFullName } = client;

  const { ageAtPhaseStart, ageAtPhaseEnd } = getClientPhaseStartEndAge(
    client!,
    carePhase,
  );

  const ageRangeString =
    ageAtPhaseStart && ageAtPhaseEnd
      ? `Age ${Math.round(ageAtPhaseStart)}-${Math.round(ageAtPhaseEnd)}`
      : null;

  const supportProviders = useSelector(
    selectSupportProviderSet,
  ).supportProviders;

  if (!client) {
    return null;
  }

  return (
    <div className="overflow-y-hidden">
      <div className="relative z-10 flex h-[48px] w-full items-center gap-1 rounded-lg bg-purple pl-12 text-white">
        <PersonIcon className={styles.clientIcon} />
        {clientFullName}
        {ageRangeString && (
          <Tooltip
            title={
              <p className="text-sm">
                Age range of {clientFullName} during this phase
              </p>
            }
          >
            <p>({ageRangeString})</p>
          </Tooltip>
        )}
      </div>

      <div className={styles.providersContainer}>
        {supportProviders.map(supportProvider => (
          <SupportProviderInput
            client={client}
            key={supportProvider.supportProviderId}
            supportProvider={supportProvider}
            selectedCarePhase={carePhase}
          />
        ))}
      </div>
      <div className="mb-2 mt-6 px-2 text-center md:text-right ">
        <SlideOutSheet
          slideOutContent={<FamilyCarePercentageSlideOutContent />}
          title="AI"
        >
          <span className="text-base font-semibold underline hover:text-purple">
            Learn more about caregiver hours
          </span>
        </SlideOutSheet>
      </div>
    </div>
  );
}

function getClientPhaseStartEndAge(client: Client, carePhase: CarePhase) {
  const {
    clientPhasePredictedEndYears,
    intakeSurvey: { clientBirthYear },
  } = client;

  const phaseStartYear = calcClientPhaseStartYears(client)[carePhase];
  const phaseEndYear = clientPhasePredictedEndYears[carePhase];
  const ageAtPhaseStart = phaseStartYear
    ? phaseStartYear - clientBirthYear
    : null;
  const ageAtPhaseEnd = phaseEndYear ? phaseEndYear - clientBirthYear : null;
  return {
    ageAtPhaseStart,
    ageAtPhaseEnd,
  };
}

export function getPartnerStartEndAgeAtClientPhase(
  client: Client,
  clientPartner: Client,
  carePhase: CarePhase,
) {
  const { clientPhasePredictedEndYears } = client;

  const {
    intakeSurvey: { clientBirthYear: partnerBirthYear },
  } = clientPartner;

  const phaseStartYear = calcClientPhaseStartYears(client)[carePhase];
  const phaseEndYear = clientPhasePredictedEndYears[carePhase];
  const partnerAgeAtPhaseStart = phaseStartYear
    ? phaseStartYear - partnerBirthYear
    : null;
  const partnerAgeAtPhaseEnd = phaseEndYear
    ? phaseEndYear - partnerBirthYear
    : null;
  return {
    partnerAgeAtPhaseStart,
    partnerAgeAtPhaseEnd,
  };
}

interface SupportProviderInputProps {
  client: Client;
  supportProvider: SupportProvider;
  selectedCarePhase: CarePhase;
}

function SupportProviderInput({
  client,
  supportProvider,
  selectedCarePhase,
}: SupportProviderInputProps) {
  const { phaseCosts } = client;

  const carePhaseIndex = carePhaseDefs[selectedCarePhase].index;
  const selectedCarePhaseCosts = phaseCosts[carePhaseIndex];
  const carePhaseDurationMonths = selectedCarePhaseCosts.phaseCareMonthsNeeded;
  const supportProviderAppliedHours = supportProviderAppliedPhaseHours(
    supportProvider,
    selectedCarePhase,
  );
  const clientPartner = useSelector(selectMaybeClientPartner);

  const isSupportProviderSpouse = (supportProvider: SupportProvider) =>
    supportProvider.supportProviderType === SupportProviderType.spouse;

  const isSpouseSupportProvider = isSupportProviderSpouse(supportProvider);
  const partnerCareOverlapMonths =
    isSpouseSupportProvider && supportProviderAppliedHours > 0
      ? calcCareOverlapWithPartner(client!, clientPartner, selectedCarePhase)
      : 0;

  const careOverlapWarning =
    partnerCareOverlapMonths > 0 ? (
      <Tooltip
        title={
          <p className="text-sm">
            {fullName(clientPartner!)} may also need care during this time.
          </p>
        }
      >
        <ExclamationTriangleIcon
          aria-hidden="true"
          className="h-5 w-5 text-yellow-400"
        />
      </Tooltip>
    ) : null;

  const startIcon =
    careOverlapWarning ??
    getIconByName(supportProvider.supportProviderName) ??
    null;

  const isProfessionalSupportProvider =
    supportProvider.supportProviderType === SupportProviderType.professional;

  const inputBoxClassName = classNames(styles.providerBox, {
    [styles.professionalProviderBox]: isProfessionalSupportProvider,
  });

  const inputLabel = getSupportProviderLabel();

  function getSupportProviderLabel() {
    let inputLabel;
    if (isSpouseSupportProvider) {
      if (clientPartner) {
        const { partnerAgeAtPhaseStart, partnerAgeAtPhaseEnd } =
          getPartnerStartEndAgeAtClientPhase(
            client,
            clientPartner,
            selectedCarePhase,
          );
        const ageRangeString =
          partnerAgeAtPhaseStart && partnerAgeAtPhaseEnd
            ? ` (Age ${Math.round(partnerAgeAtPhaseStart)}-${Math.round(partnerAgeAtPhaseEnd)})`
            : '';
        inputLabel = fullName(clientPartner) + ageRangeString;
      } else {
        inputLabel = supportProvider.supportProviderName;
      }
    } else {
      inputLabel = supportProvider.supportProviderName;
    }
    return inputLabel;
  }

  const calcWeeklyHours = (totalHours: number) => {
    const averageWeeksPerMonth = 4.345;
    return totalHours / (carePhaseDurationMonths * averageWeeksPerMonth);
  };

  const [weeklyHours, setWeeklyHours] = useState<number | null>(
    calcWeeklyHours(supportProviderAppliedHours),
  );

  const changeSupportProviderHoursCallback =
    useChangeSupportProviderHoursCallback(
      supportProvider,
      selectedCarePhase,
      false,
    );
  const previewSupportProviderHoursCallback =
    useChangeSupportProviderHoursCallback(
      supportProvider,
      selectedCarePhase,
      true,
    );

  const handleChange = (newValue: number | null) => {
    // setWeeklyHours(newValue ? calcWeeklyHours(newValue) : null);
    changeSupportProviderHoursCallback(newValue);
  };

  const handlePreview = (newValue: number | null) => {
    // setWeeklyHours(newValue ? calcWeeklyHours(newValue) : null);
    previewSupportProviderHoursCallback(newValue);
  };

  useEffect(() => {
    setWeeklyHours(calcWeeklyHours(supportProviderAppliedHours));
  }, [supportProviderAppliedHours]);

  return (
    <>
      <ThousandsIntegerInput
        classNames={{
          container: styles.providerContainer,
          box: inputBoxClassName,
        }}
        label={inputLabel}
        unit="hrs"
        errorMessage="Whole numbers only"
        disabled={isProfessionalSupportProvider}
        value={supportProviderAppliedHours}
        onChange={handleChange}
        onPreview={handlePreview}
        showStepper={!isProfessionalSupportProvider}
        startAdornment={
          <InputAdornment position="start">{startIcon}</InputAdornment>
        }
      />
      <div className="mr-2 pt-1 text-end ">
        <span className="rounded-sm bg-gray-100 p-1 text-sm font-semibold text-purple">
          {weeklyHours === 0 || weeklyHours === null
            ? `0 hrs/week`
            : weeklyHours < 1
              ? 'Less than 1 hr/week'
              : `${Math.round(weeklyHours)} hrs/week`}
        </span>
      </div>
    </>
  );
}

function applyCarePhaseHours(
  supportProvider: SupportProvider,
  selectedCarePhase: CarePhase,
  value: number | null,
): SupportProvider {
  const updatedValue = value ?? 0;
  let savingSupportProvider = { ...supportProvider };
  switch (selectedCarePhase) {
    case CarePhase.earlyCare:
      savingSupportProvider.supportProviderPhaseOneHours = updatedValue;
      break;
    case CarePhase.moderateCare:
      savingSupportProvider.supportProviderPhaseTwoHours = updatedValue;
      break;
    // Add other cases as necessary
    case CarePhase.fullCare:
      savingSupportProvider.supportProviderPhaseThreeHours = updatedValue;
      break;
  }
  return savingSupportProvider;
}

function useChangeSupportProviderHoursCallback(
  supportProvider: SupportProvider,
  selectedCarePhase: CarePhase,
  isPreview: boolean,
) {
  const client = useSelector(selectClient);
  const { supportProviderSet } = client;
  const dispatch = useDispatch();

  return useCallback(
    (value: number | null) => {
      const savingSupportProvider = applyCarePhaseHours(
        supportProvider,
        selectedCarePhase,
        value,
      );
      const savingSupportProviderSet = updateSupportProviderSet(
        supportProviderSet,
        savingSupportProvider,
        false,
      );
      const action = isPreview
        ? previewClientUpdates(
            produce(client, client => {
              client.supportProviderSet = savingSupportProviderSet;
            }),
          )
        : putSupportProviderSetForClientByClientIdRequest({
            supportProviderSet: savingSupportProviderSet,
          });

      dispatch(action);
    },
    [client, dispatch, supportProvider, supportProviderSet, selectedCarePhase],
  );
}

function supportProviderAppliedPhaseHours(
  supportProvider: SupportProvider,
  selectedCarePhase: CarePhase,
): number {
  return selectedCarePhase === CarePhase.earlyCare
    ? supportProvider.supportProviderAppliedPhaseOneHours
    : selectedCarePhase === CarePhase.moderateCare
      ? supportProvider.supportProviderAppliedPhaseTwoHours
      : supportProvider.supportProviderAppliedPhaseThreeHours;
}

function calcCareOverlapWithPartner(
  client: Client,
  clientPartner: Client | null,
  carePhase: CarePhase,
) {
  if (!clientPartner) {
    return 0;
  }
  const { clientPhasePredictedEndYears } = client;
  const phaseStartYears = calcClientPhaseStartYears(client);
  // get predicted beginning and end of client's care phase
  const phaseStartYear = phaseStartYears[carePhase];
  const phaseEndYear = clientPhasePredictedEndYears[carePhase];
  // get beginning and end of partner's care duration
  const partnerCareStartYear =
    clientPartner.appliedInferenceSet.ltcAtAge +
    clientPartner.intakeSurvey.clientBirthYear;
  const partnerCareEndYear =
    partnerCareStartYear +
    clientPartner.allPhaseCosts.allPhaseCareMonthsNeeded / 12;

  if (partnerCareEndYear < phaseStartYear!) {
    // if partner care ends before client's care phase starts, set overlap to the entire phase duration
    // In case they outlive their prediction, we assume they'll still be receving care
    const carePhaseIndex = carePhaseDefs[carePhase].index;
    return client.phaseCosts[carePhaseIndex].phaseCareMonthsNeeded;
  }

  // calculate month overlap
  const overlapStartYear = Math.max(phaseStartYear!, partnerCareStartYear);
  const overlapEndYear = Math.min(phaseEndYear!, partnerCareEndYear);
  const overlapYears = Math.max(0, overlapEndYear - overlapStartYear);
  return overlapYears * 12;
}

function isPartnerCareGivingOverlapping(
  client: Client,
  clientPartner: Client | null,
  carePhase: CarePhase,
  supportProviderSet: SupportProviderSet,
): boolean {
  if (!clientPartner) {
    return false;
  }

  const isSupportProviderSpouse = (supportProvider: SupportProvider) =>
    supportProvider.supportProviderType === SupportProviderType.spouse;

  const getSupportProviderAppliedHours = (
    supportProvider: SupportProvider,
    carePhase: CarePhase,
  ) => {
    return carePhase === CarePhase.earlyCare
      ? supportProvider.supportProviderAppliedPhaseOneHours
      : carePhase === CarePhase.moderateCare
        ? supportProvider.supportProviderAppliedPhaseTwoHours
        : supportProvider.supportProviderAppliedPhaseThreeHours;
  };

  const spouseSupportProvider = supportProviderSet.supportProviders.find(
    supportProvider => isSupportProviderSpouse(supportProvider),
  );

  if (
    !spouseSupportProvider ||
    getSupportProviderAppliedHours(spouseSupportProvider, carePhase) <= 0
  ) {
    return false;
  }

  const partnerCareOverlapMonths = calcCareOverlapWithPartner(
    client!,
    clientPartner,
    carePhase,
  );

  return partnerCareOverlapMonths > 0;
}

interface PartnerCareOverlapWarningProps {
  overlapMonths: number;
  clientPartner: Client;
  client: Client;
  phaseCareMonthsNeeded: number;
}

function PartnerCareOverlapWarning(props: PartnerCareOverlapWarningProps) {
  return (
    <div className="rounded-md bg-yellow-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon
            aria-hidden="true"
            className="h-5 w-5 text-yellow-400"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Caregiver Capacity Alert
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              {fullName(props.clientPartner)} is projected to need long-term
              care during this time ({Math.round(props.overlapMonths)} months of
              this care phase). Consider designating these care hours to an
              alternative caregiver.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
