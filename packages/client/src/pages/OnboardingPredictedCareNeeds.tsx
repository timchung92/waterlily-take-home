import { useSelector } from 'react-redux';
import { startCase } from 'lodash';
import {
  OnboardingChrome,
  DurationSlideOutContent,
  CareHoursStartSlideOutContent,
  CareHoursEndSlideOutContent,
  Badge,
} from '../components';
import { selectClient, selectIntakeSurvey } from '../model';
import { possessivePronoun } from '../util';
import moduleStyles from './OnboardingOurPredictions.module.css';
import mainStyles from '../styles/main.module.css';
import { SlideContent, SlideOutSheet } from '../components';

import { BsFillQuestionCircleFill } from 'react-icons/bs';
import {
  carePhaseDefs,
  formatDurationYears,
  CarePhase,
  isDurationCustom,
} from '@shared';

const styles = {
  ...mainStyles,
  ...moduleStyles,
};

export function OnboardingPredictedCareNeeds(_props: ClientIdProps) {
  const { clientFirstName } = useSelector(selectClient);

  return (
    <OnboardingChrome
      slidePage={OnboardingPredictedCareNeeds}
      nextButtonLabel={`See ${clientFirstName}'s Costs`}
    >
      <SlideContent headerText={`${clientFirstName}'s predicted care needs`}>
        <div className="lg:gap-30 flex flex-col gap-12 pb-12 pt-12 md:pt-16 lg:flex-row">
          <ColumnLengthOfCareYears />
          <ColumnCareHoursLtcStart />
          <ColumnCareHoursLtcEnd />
        </div>
      </SlideContent>
    </OnboardingChrome>
  );
}

function ColumnLengthOfCareYears() {
  const intakeSurvey = useSelector(selectIntakeSurvey);
  const {
    phaseCosts,
    allPhaseCosts: { allPhaseCareMonthsNeeded },
  } = useSelector(selectClient);
  const ltcDurationYears = allPhaseCareMonthsNeeded / 12;
  return (
    <div className="flex-grow-1 basis-1/2 text-center">
      <div className={styles.subtitle}>
        {startCase(possessivePronoun(intakeSurvey))} length of care:
        <SlideOutSheet
          slideOutContent={<DurationSlideOutContent />}
          title="AI"
        >
          <BsFillQuestionCircleFill
            className="h-5 w-5 pb-1 pl-1 text-gray-400 hover:text-gray-500"
            aria-hidden="true"
          />
        </SlideOutSheet>
      </div>
      <div className="text-7xl font-bold text-purple md:text-9xl">
        {formatDurationYears(ltcDurationYears)}
        <span className={styles.percentSymbol}></span>
      </div>

      <div className="text-lg font-normal text-gray-700 md:text-xl">
        years
        {isDurationCustom(phaseCosts) && (
          <Badge
            color="gray"
            label="edited"
            className="ml-1"
          />
        )}
      </div>
    </div>
  );
}

function ColumnCareHoursLtcStart() {
  const intakeSurvey = useSelector(selectIntakeSurvey);
  const { phaseCosts } = useSelector(selectClient);
  const phaseIndex = carePhaseDefs[CarePhase.earlyCare].index;
  const earlyCarePhaseCosts = phaseCosts[phaseIndex];
  const { phaseCareHoursNeeded, phaseCareMonthsNeeded } = earlyCarePhaseCosts;
  const weeksPerMonth = 4.33;
  const hoursPerWeek =
    phaseCareHoursNeeded / phaseCareMonthsNeeded / weeksPerMonth;

  return (
    <div className="flex-grow-1 basis-1/2 text-center">
      <div className={styles.subtitle}>
        {startCase(possessivePronoun(intakeSurvey))} initial care needs:
        <SlideOutSheet
          slideOutContent={<CareHoursStartSlideOutContent />}
          title="AI"
        >
          <BsFillQuestionCircleFill
            className="h-5 w-5 pb-1 pl-1 text-gray-400 hover:text-gray-500"
            aria-hidden="true"
          />
        </SlideOutSheet>
      </div>
      <div className="text-7xl font-bold text-purple md:text-9xl">
        {Math.round(hoursPerWeek)}
        <span className={styles.percentSymbol}></span>
      </div>
      <div className="text-lg font-normal text-gray-700 md:text-xl">
        hours/week
      </div>
    </div>
  );
}

function ColumnCareHoursLtcEnd() {
  const { phaseCosts } = useSelector(selectClient);
  const intakeSurvey = useSelector(selectIntakeSurvey);
  const phaseIndex = carePhaseDefs[CarePhase.fullCare].index;
  const earlyCarePhaseCosts = phaseCosts[phaseIndex];
  const { phaseCareHoursNeeded, phaseCareMonthsNeeded } = earlyCarePhaseCosts;
  const weeksPerMonth = 4.33;
  const hoursPerWeek =
    phaseCareHoursNeeded / phaseCareMonthsNeeded / weeksPerMonth;

  return (
    <div className="flex-grow-1 basis-1/2 text-center">
      <div className={styles.subtitle}>
        {startCase(possessivePronoun(intakeSurvey))} later care needs:
        <SlideOutSheet
          slideOutContent={<CareHoursEndSlideOutContent />}
          title="AI"
        >
          <BsFillQuestionCircleFill
            className="h-5 w-5 pb-1 pl-1 text-gray-400 hover:text-gray-500"
            aria-hidden="true"
          />
        </SlideOutSheet>
      </div>
      <div className="text-7xl font-bold text-purple md:text-9xl">
        {Math.round(hoursPerWeek)}
        <span className={styles.percentSymbol}></span>
      </div>
      <div className="text-lg font-normal text-gray-700 md:text-xl">
        hours/week
      </div>
    </div>
  );
}
