import { useDispatch, useSelector } from 'react-redux';
import {
  CareSettingsSlideOutContent,
  SlideOutSheet,
  OnboardingChrome,
  Badge,
} from '../components';
import {
  putCareEnvironmentSelectionsForClientByClientIdRequest,
  selectClient,
} from '../model';
import { CarePhaseCostSummary } from '../components/CarePhaseCostSummary';
import { formatCurrency } from '@shared/formatCurrency';
import { SlideContent } from '../components/SlideContent';
import { FunctionComponent, useState } from 'react';
import {
  careEnvironmentsApplicableToPhase,
  carePhaseDefs,
  CareEnvironment,
  CarePhase,
  pickClientCareEnvironmentCosts,
} from '@shared';
import {
  OnboardingFamilyCaregivingPhaseOne,
  OnboardingFamilyCaregivingPhaseTwo,
  OnboardingFamilyCaregivingPhaseThree,
  OnboardingCarePhasesSummary,
  OnboardingCarePhasesPhaseTwo,
  OnboardingCarePhasesPhaseThree,
} from '../pages';
import { HiHome } from 'react-icons/hi2';
import { BiSolidBuildingHouse } from 'react-icons/bi';
import { FaBuildingUser } from 'react-icons/fa6';
import { FaHospitalUser } from 'react-icons/fa6';
import { ClockIcon } from '@heroicons/react/24/outline';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { BsCheckCircleFill } from 'react-icons/bs';
import { CustomizePlanButtonGroup, isInferenceEdited } from '..';

function determineNextSlide(isCareSettingHome: boolean, carePhase: CarePhase) {
  if (isCareSettingHome) {
    switch (carePhaseDefs[carePhase].index) {
      case 0:
        return OnboardingFamilyCaregivingPhaseOne;
      case 1:
        return OnboardingFamilyCaregivingPhaseTwo;
      case 2:
        return OnboardingFamilyCaregivingPhaseThree;
      default:
        return undefined;
    }
  }

  switch (carePhaseDefs[carePhase].index) {
    case 0:
      return OnboardingCarePhasesPhaseTwo;
    case 1:
      return OnboardingCarePhasesPhaseThree;
    case 2:
      return OnboardingCarePhasesSummary;
    default:
      return undefined;
  }
}

function determineNextSlideLabel(
  isCareSettingHome: boolean,
  carePhase: CarePhase,
  clientFirstName: string,
) {
  if (isCareSettingHome) {
    return `Next`;
  }

  return carePhaseDefs[carePhase].index === 2 // check if last phase
    ? `Review ${clientFirstName}'s Costs`
    : `Go to ${carePhaseDefs[carePhase + 1].label}`;
}

interface CarePhaseProps {
  carePhase: CarePhase;
  slidePage: FunctionComponent<ClientIdProps>;
}

function OnboardingCareSettings({ carePhase, slidePage }: CarePhaseProps) {
  const client = useSelector(selectClient)!;
  const {
    clientFirstName,
    intakeSurvey: {
      clientBirthYear,
      clientCurrentCarePhase,
      clientPhaseStartAges,
    },
    phaseCosts,
    clientPhasePredictedStartYears,
    clientPhaseInflationFactors,
  } = client;

  const dispatch = useDispatch();
  const [selectedCareSetting, setSelectedCareSetting] = useState<number | null>(
    client.careEnvironmentSelections?.[carePhase] ?? null,
  );
  const carePhaseIndex = carePhaseDefs[carePhase].index;
  const selectedCarePhaseCosts = phaseCosts[carePhaseIndex];
  const predictedPhaseStartYear = clientPhasePredictedStartYears[carePhase];
  const phaseAge = predictedPhaseStartYear
    ? predictedPhaseStartYear - clientBirthYear
    : clientPhaseStartAges[carePhase]!;
  const carePhaseDurationMonths = selectedCarePhaseCosts.phaseCareMonthsNeeded;
  const applicableCareSettings = careEnvironmentsApplicableToPhase[carePhase];
  const carePhaseStartAge = clientPhaseStartAges[carePhase];
  const isDurationCustom = selectedCarePhaseCosts.isDurationCustom;

  const handleButtonClick = (careSettingDbId: number) => {
    if (careSettingDbId === selectedCareSetting) {
      setSelectedCareSetting(null);

      dispatch(
        putCareEnvironmentSelectionsForClientByClientIdRequest({
          clientId: client.clientId,
          careEnvironmentSelections: {
            ...(client.careEnvironmentSelections ?? {}),
            [carePhase]: null,
          },
        }),
      );
      return;
    }

    setSelectedCareSetting(careSettingDbId);
    dispatch(
      putCareEnvironmentSelectionsForClientByClientIdRequest({
        clientId: client.clientId,
        careEnvironmentSelections: {
          ...(client.careEnvironmentSelections ?? {}),
          [carePhase]: careSettingDbId,
        },
      }),
    );
  };

  const isCareSettingHome = selectedCareSetting === CareEnvironment.home;

  return (
    <>
      <OnboardingChrome
        slidePage={slidePage}
        nextButtonLabel={determineNextSlideLabel(
          isCareSettingHome,
          carePhase,
          clientFirstName,
        )}
        nextSlidePage={determineNextSlide(isCareSettingHome, carePhase)}
        disableNextButton={selectedCareSetting === null}
        errorModalMessage="Oops! You need to select a care setting to continue."
      >
        <SlideContent
          headerText={
            <div className="flex items-center gap-2 md:gap-4">
              {carePhaseDefs[carePhase].label}
              <span className="rounded-2xl border border-gray-300 bg-gray-100 px-2 py-1 text-base font-semibold md:text-lg">
                Stage {carePhaseIndex + 1} of 3
              </span>
            </div>
          }
          headerSubText={
            <>
              <div className="flex flex-col text-base md:text-lg">
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="hidden h-5 w-5 md:block md:h-6 md:w-6" />
                  <div>
                    {carePhase === clientCurrentCarePhase
                      ? `Began at age ${Math.round(carePhaseStartAge!)}`
                      : `Estimated begin: ${Math.round(phaseAge)} years old`}
                    {isInferenceEdited(client, 'ltcAtAge') && (
                      <Badge
                        color="gray"
                        label="edited"
                        className="ml-2"
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="hidden h-5 w-5 md:block md:h-6 md:w-6" />
                  <div>
                    {`Estimated duration: ${carePhaseDurationMonths} ${carePhase === clientCurrentCarePhase ? 'more ' : ''} months`}
                    {isDurationCustom && (
                      <Badge
                        color="gray"
                        label="edited"
                        className="ml-2"
                      />
                    )}
                  </div>
                </div>
              </div>
            </>
          }
        >
          <CustomizePlanButtonGroup
            client={client}
            className="my-5"
            showDisqualifyingConditionsBtn={false}
          />
          <div className="mb-6 flex flex-col gap-8 md:mt-8 md:grid-cols-2 md:flex-row lg:mb-0">
            <div className="flex flex-col md:w-3/5 md:max-w-[70%]">
              <div className="mb-6 text-xl font-normal leading-6 text-darkPurple md:mb-0">
                <span className="font-semibold">Select</span>
                {carePhase === clientCurrentCarePhase
                  ? ` where ${clientFirstName} is living during ${carePhaseDefs[carePhase].label}.`
                  : ` where ${clientFirstName} will live during ${carePhaseDefs[carePhase].label}.`}
              </div>
              <div className="grid flex-grow grid-cols-1 gap-8 md:grid-cols-2">
                {applicableCareSettings.map(careSettingData => (
                  <button key={careSettingData.dbId}>
                    <div
                      className={`col-span-1 flex justify-start gap-2 rounded-2xl border px-3 py-4 text-left hover:border-2 md:h-[75%] md:flex-col md:items-center md:justify-center md:gap-2 md:px-4 md:py-0 md:pb-3 md:text-center ${
                        selectedCareSetting === careSettingData.dbId
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-700  hover:bg-gray-50 hover:ring-darkPurple '
                      }`}
                      onClick={() => handleButtonClick(careSettingData.dbId)}
                    >
                      {careSettingData.dbId ===
                      selectedCarePhaseCosts.recommendedCareEnvironment ? (
                        <div className="absolute ml-2 -translate-y-8 self-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 md:relative md:ml-0 md:-translate-y-10">
                          Predicted
                        </div>
                      ) : (
                        <div className="md:py-3"> </div> // for spacing
                      )}

                      <div className="flex  items-center">
                        {(() => {
                          if (careSettingData.dbId === selectedCareSetting) {
                            return (
                              <BsCheckCircleFill className="text-lg text-green-600 md:text-3xl" />
                            );
                          }

                          switch (careSettingData.dbId) {
                            case CareEnvironment.home:
                              return <HiHome className="text-xl md:text-4xl" />;
                            case CareEnvironment.independentLiving:
                              return (
                                <BiSolidBuildingHouse className="text-xl md:text-4xl" />
                              );
                            case CareEnvironment.assistedLiving:
                              return (
                                <FaBuildingUser className="text-xl md:text-4xl" />
                              );
                            case CareEnvironment.fullCareFacility:
                              return (
                                <FaHospitalUser className="text-xl md:text-4xl" />
                              );
                          }
                        })()}
                      </div>
                      <div className="mt-[2px] flex-1 text-lg font-semibold text-darkPurple md:mt-0 md:flex-none md:text-2xl">
                        {careSettingData.label}{' '}
                      </div>

                      <div className="flex justify-end">
                        <div className="">
                          <span className="inline-flex items-center text-base font-normal leading-8 text-darkPurple">
                            {careSettingData.dbId === CareEnvironment.home
                              ? '$0 - ' +
                                formatCurrency(
                                  calcInflatedMaximumFamilyShareCostFor(
                                    selectedCarePhaseCosts,
                                    client,
                                    clientPhaseInflationFactors[carePhase]!,
                                  ),
                                )
                              : formatCurrency(
                                  calcInflatedProfessionalShareCostFor(
                                    selectedCarePhaseCosts,
                                    client,
                                    clientPhaseInflationFactors[carePhase]!,
                                    careSettingData.dbId as CareEnvironment,
                                  ),
                                )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <SlideOutSheet
                slideOutContent={<CareSettingsSlideOutContent />}
                title="FAQ"
              >
                <div className="mt-6 text-base font-semibold text-darkPurple underline hover:text-purple md:mt-0">
                  What are care settings?
                </div>
              </SlideOutSheet>
            </div>
            <CarePhaseCostSummary
              client={client}
              carePhase={carePhase}
            />
          </div>
        </SlideContent>
      </OnboardingChrome>
    </>
  );
}

export function OnboardingCareSettingsPhaseOne({ clientId }: ClientIdProps) {
  return (
    <OnboardingCareSettings
      carePhase={carePhaseDefs.earlyCare.value}
      slidePage={OnboardingCareSettingsPhaseOne}
    />
  );
}

export function OnboardingCareSettingsPhaseTwo({ clientId }: ClientIdProps) {
  return (
    <OnboardingCareSettings
      carePhase={carePhaseDefs.moderateCare.value}
      slidePage={OnboardingCareSettingsPhaseTwo}
    />
  );
}

export function OnboardingCareSettingsPhaseThree({ clientId }: ClientIdProps) {
  return (
    <OnboardingCareSettings
      carePhase={carePhaseDefs.fullCare.value}
      slidePage={OnboardingCareSettingsPhaseThree}
    />
  );
}

function calcInflatedMaximumFamilyShareCostFor(
  phaseCosts: SinglePhaseCosts,
  client: Client,
  phaseInflationFactor: number,
) {
  const careEnvironmentCostData = pickClientCareEnvironmentCosts(
    client,
    CareEnvironment.home,
  );
  return (
    careEnvironmentCostData.rateAmount *
    phaseCosts.phaseCareHoursNeeded *
    phaseInflationFactor
  );
}

function calcInflatedProfessionalShareCostFor(
  phaseCosts: SinglePhaseCosts,
  client: Client,
  phaseInflationFactor: number,
  careEnvironment: CareEnvironment,
) {
  const careEnvironmentCostData = pickClientCareEnvironmentCosts(
    client,
    careEnvironment,
  );
  return (
    careEnvironmentCostData.rateAmount *
    phaseCosts.phaseCareMonthsNeeded *
    phaseInflationFactor
  );
}
