import { useSelector } from 'react-redux';
import {
  EarlyCareSlideOutContent,
  FullCareSlideOutContent,
  ModerateCareSlideOutContent,
  OnboardingChrome,
  Badge,
  CustomizePlanButtonGroup,
} from '../components';
import { OnboardingCostFactors } from '.';
import { selectClient } from '../model';
import {
  CarePhaseDef,
  carePhaseDefList,
  CarePhase,
  isNullOrUndefined,
  carePhaseDefs,
  CareEnvironment,
  formatDurationYears,
  formatInteger,
  isDurationCustom,
} from '@shared';
import { SlideContent } from '../components/SlideContent';
import {
  getCareSettingsPageBy,
  getFamilyInvolvementPageBy,
} from '../util/navigationLogic';

import { FunctionComponent, useEffect, useRef } from 'react';
import { CarePhaseDataItem, PhaseCard } from '../components/PhaseCard';
import {
  BiCircleHalf,
  BiCircleQuarter,
  BiCircleThreeQuarter,
} from 'react-icons/bi';
import { ArrowRight, Clock4Icon } from 'lucide-react';

function findEntryByValue(value: CarePhase): CarePhaseDef | undefined {
  return carePhaseDefList.find(entry => entry.value === value);
}

function determineTimelineText(
  client: Client,
  carePhase: CarePhase,
  phaseStartAge: number | null,
) {
  const {
    intakeSurvey: { clientCurrentCarePhase },
  } = client;

  const phaseIndex = carePhaseDefs[carePhase].index;
  const phaseStartAgeText = phaseStartAge ? `${Math.round(phaseStartAge)}` : '';
  // present if current phase is equal to the phase
  if (clientCurrentCarePhase === carePhase) {
    return `Since age ${phaseStartAgeText}`;
  }

  // future if current phase is null or undefined
  if (isNullOrUndefined(clientCurrentCarePhase)) {
    return `Expected age ${phaseStartAgeText} `;
  }

  // past if current phase index is greater than the phase index
  const clientCurrentCarePhaseDef = findEntryByValue(clientCurrentCarePhase);
  if (clientCurrentCarePhaseDef!.index > phaseIndex) {
    return `Past`;
  }

  // future if current phase index is less than the phase index
  return `Expected age ${phaseStartAgeText}`;
}

function determineTimelineTooltip(client: Client, carePhase: CarePhase) {
  const {
    intakeSurvey: {
      clientPhaseStartAges,
      clientCurrentCarePhase,
      clientBirthYear,
    },
    clientPhasePredictedStartYears,
  } = client;

  const phaseIndex = carePhaseDefs[carePhase].index;
  // present if current phase is equal to the phase
  if (clientCurrentCarePhase === carePhase) {
    return `Since ${Math.round(clientPhaseStartAges[carePhase]! + clientBirthYear)}`;
  }

  // future if current phase is null or undefined
  if (isNullOrUndefined(clientCurrentCarePhase)) {
    return `Expected ${Math.round(clientPhasePredictedStartYears[carePhase]!)}`;
  }

  // past if current phase index is greater than the phase index
  const clientCurrentCarePhaseDef = findEntryByValue(clientCurrentCarePhase);
  if (clientCurrentCarePhaseDef!.index > phaseIndex) {
    return `Past`;
  }

  // future if current phase index is less than the phase index
  return `Expected ${Math.round(clientPhasePredictedStartYears[carePhase]!)}`;
}

function determinePreviousSlide(
  client: Client,
  carePhase: CarePhase,
  careEnvironmentSelections: CareEnvironmentSelections,
) {
  const { clientCurrentCarePhase } = client.intakeSurvey;
  if (
    carePhase === CarePhase.earlyCare ||
    carePhase === clientCurrentCarePhase
  ) {
    return OnboardingCostFactors;
  }

  if (
    careEnvironmentSelections[(carePhase - 1) as CarePhase] ===
    CareEnvironment.home
  ) {
    return getFamilyInvolvementPageBy(carePhase - 1);
  }

  return getCareSettingsPageBy(carePhase - 1);
}

interface CarePhaseProps {
  carePhase: CarePhase;
  slidePage: FunctionComponent<ClientIdProps>;
}

const CARE_PHASE_CONFIGS: Omit<
  CarePhaseDataItem,
  keyof ReturnType<typeof getCarePhaseData>
>[] = [
  {
    value: CarePhase.earlyCare,
    carePhase: carePhaseDefList[0].label,
    adlRange: '1-2',
    careSettingOptions: 'Home and Independent Living',
    adlRangeIcon: <BiCircleQuarter />,
    slideOutContent: <EarlyCareSlideOutContent />,
  },
  {
    value: CarePhase.moderateCare,
    carePhase: carePhaseDefList[1].label,
    adlRange: '3-4',
    careSettingOptions: 'Home and Assisted Living',
    adlRangeIcon: <BiCircleHalf />,
    slideOutContent: <ModerateCareSlideOutContent />,
  },
  {
    value: CarePhase.fullCare,
    carePhase: carePhaseDefList[2].label,
    adlRange: '5-6',
    careSettingOptions: 'Home and Nursing Home',
    adlRangeIcon: <BiCircleThreeQuarter />,
    slideOutContent: <FullCareSlideOutContent />,
  },
];

interface CareTimelineDurationProps {
  clientHasStartedLtc: boolean;
  ltcDurationYears: number;
  phaseCosts: SinglePhaseCosts[];
}

function CareTimelineDuration({
  clientHasStartedLtc,
  ltcDurationYears,
  phaseCosts,
}: CareTimelineDurationProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex w-full items-center gap-3 rounded-md bg-backgroundPurple px-2 py-1.5 text-base lg:w-auto lg:gap-2">
        <Clock4Icon className="h-5 w-5 md:block md:h-4 md:w-4" />
        <span className="flex flex-col md:flex-row md:gap-1">
          <p>
            {`Estimated ${clientHasStartedLtc ? 'remaining ' : ''}care duration`}
          </p>
          <p className="font-semibold text-mediumPurple">
            {`${formatDurationYears(ltcDurationYears)} years (${formatInteger(
              ltcDurationYears * 12,
            )} months)`}
            {isDurationCustom(phaseCosts) && (
              <Badge
                color="gray"
                label="edited"
                className="ml-2 bg-violet-50"
              />
            )}
          </p>
        </span>
      </span>
    </div>
  );
}

function OnboardingCarePhases({ carePhase, slidePage }: CarePhaseProps) {
  const client = useSelector(selectClient)!;
  const {
    clientId,
    clientFirstName,
    intakeSurvey: { clientHasStartedLtc, clientCurrentCarePhase },
    allPhaseCosts: { allPhaseCareMonthsNeeded },
    phaseCosts,
  } = client;

  const ltcDurationYears = allPhaseCareMonthsNeeded / 12;

  const carePhaseData: CarePhaseDataItem[] = CARE_PHASE_CONFIGS.map(config => ({
    ...config,
    ...getCarePhaseData(client, config.value),
  }));

  // Handle scrolling to the active phase card
  const activePhaseRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (activePhaseRef.current) {
      activePhaseRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [carePhase]);

  return (
    <OnboardingChrome
      slidePage={slidePage}
      nextButtonLabel={`Review ${carePhaseDefs[carePhase].label}`}
      previousSlidePage={determinePreviousSlide(
        client,
        carePhase,
        client.careEnvironmentSelections,
      )}
    >
      <SlideContent
        headerText={`${clientFirstName}'s care timeline`}
        headerSubText={
          <CareTimelineDuration
            clientHasStartedLtc={clientHasStartedLtc}
            ltcDurationYears={ltcDurationYears}
            phaseCosts={phaseCosts}
          />
        }
      >
        <CustomizePlanButtonGroup
          client={client}
          className="my-5"
          showDisqualifyingConditionsBtn={false}
        />
        <div className="bg-white md:mt-8">
          <div className="max-w-5xl pb-8 md:mx-auto md:px-4">
            <div className="mx-auto flex max-w-2xl gap-2 overflow-x-auto md:max-w-none lg:grid lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
              {carePhaseData.map((phase, index) => (
                <>
                  <div
                    key={phase.carePhase}
                    className="flex-shrink-0"
                    // Add ref to the active phase card
                    ref={phase.value === carePhase ? activePhaseRef : null}
                  >
                    <PhaseCard
                      phase={phase}
                      carePhase={carePhase}
                      clientId={clientId}
                      clientHasStartedLtc={clientHasStartedLtc}
                      clientCurrentCarePhase={clientCurrentCarePhase}
                      client={client}
                      timelineText={determineTimelineText(
                        client,
                        phase.value,
                        phase.phaseStartAge,
                      )}
                      timelineTooltip={determineTimelineTooltip(
                        client,
                        phase.value,
                      )}
                    />
                  </div>
                  {index < carePhaseData.length - 1 && (
                    <div className="flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                </>
              ))}
            </div>
          </div>
        </div>
      </SlideContent>
    </OnboardingChrome>
  );
}

function getCarePhaseData(client: Client, carePhase: CarePhase) {
  const {
    intakeSurvey: {
      clientPhaseStartAges,
      clientBirthYear,
      clientCurrentCarePhase,
    },
    phaseCosts,
    careEnvironmentSelections,
    clientPhasePredictedStartYears,
  } = client;

  const carePhaseIndex = carePhaseDefs[carePhase].index;
  const selectedCarePhaseCosts = phaseCosts[carePhaseIndex];
  const phaseCareMonthsNeeded = selectedCarePhaseCosts.phaseCareMonthsNeeded;
  const phaseInflatedProfessionalShareCost =
    selectedCarePhaseCosts.phaseInflatedProfessionalShareCost;
  const predictedPhaseStartYear = clientPhasePredictedStartYears[carePhase];
  const predictedPhaseStartAge = predictedPhaseStartYear
    ? predictedPhaseStartYear - clientBirthYear
    : clientPhaseStartAges[carePhase]!;

  const selectedCareEnvironment = careEnvironmentSelections[carePhase] ?? null;
  const phaseStartAge =
    clientCurrentCarePhase === carePhase
      ? clientPhaseStartAges[carePhase]
      : predictedPhaseStartAge;

  const isDurationCustom = selectedCarePhaseCosts.isDurationCustom;

  return {
    phaseStartAge,
    phaseCareMonthsNeeded,
    selectedCareEnvironment,
    phaseInflatedProfessionalShareCost,
    isDurationCustom,
  };
}

export function OnboardingCarePhasesPhaseOne({ clientId }: ClientIdProps) {
  return (
    <OnboardingCarePhases
      carePhase={carePhaseDefs.earlyCare.value}
      slidePage={OnboardingCarePhasesPhaseOne}
    />
  );
}

export function OnboardingCarePhasesPhaseTwo({ clientId }: ClientIdProps) {
  return (
    <OnboardingCarePhases
      carePhase={carePhaseDefs.moderateCare.value}
      slidePage={OnboardingCarePhasesPhaseTwo}
    />
  );
}

export function OnboardingCarePhasesPhaseThree({ clientId }: ClientIdProps) {
  return (
    <OnboardingCarePhases
      carePhase={carePhaseDefs.fullCare.value}
      slidePage={OnboardingCarePhasesPhaseThree}
    />
  );
}
