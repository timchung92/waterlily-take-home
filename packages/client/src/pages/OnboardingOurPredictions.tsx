import { useSelector } from 'react-redux';
import { startCase } from 'lodash';
import {
  Citations,
  OnboardingChrome,
  citations,
  LikelihoodSlideOutContent,
  LtcAtAgeSlideOutContent,
} from '../components';
import {
  selectAppliedInferenceSet,
  selectClient,
  selectInferenceSet,
  selectIntakeSurvey,
} from '../model';
import { isInferenceEdited, possessivePronoun } from '../util';
import moduleStyles from './OnboardingOurPredictions.module.css';
import mainStyles from '../styles/main.module.css';
import { SlideContent, SlideOutSheet } from '../components';

import { BsFillQuestionCircleFill } from 'react-icons/bs';
import { Badge } from '../components/Badge';

const styles = {
  ...mainStyles,
  ...moduleStyles,
};

export function OnboardingOurPredictions(_props: ClientIdProps) {
  const {
    clientFirstName,
    appliedInferenceSet: { ltcAtAgeShowRange },
  } = useSelector(selectClient);

  return (
    <OnboardingChrome
      slidePage={OnboardingOurPredictions}
      nextButtonLabel={`${clientFirstName}'s Care Needs`}
    >
      <SlideContent headerText={`Our predictions for ${clientFirstName}`}>
        <div className="flex flex-col gap-12 pb-12 pt-12 lg:flex-row lg:gap-32">
          <ColumnLtcLikelihoodEver />
          <ColumnLtcAtAge />
          <ColumnLtcAgeFallBack />
        </div>
        <div className="py-8 md:py-16">
          <Citations
            citations={
              ltcAtAgeShowRange
                ? [
                    citations.onboardingOurPredictionsLikelihoodNationalAverage,
                    citations.onboardingOurPredictionsLtcAtAgeRange,
                  ]
                : [citations.onboardingOurPredictionsLikelihoodNationalAverage]
            }
          />
        </div>
      </SlideContent>
    </OnboardingChrome>
  );
}

export function ColumnLtcLikelihoodEver() {
  const { clientFirstName } = useSelector(selectClient);
  const intakeSurvey = useSelector(selectIntakeSurvey);
  const { ltcLikelihoodEver } = useSelector(selectInferenceSet);
  return (
    <div className="flex-grow-1 basis-1/2 text-center">
      <div className="text-xl font-semibold text-darkPurple">
        {startCase(possessivePronoun(intakeSurvey))} likelihood of needing LTC
        <SlideOutSheet
          slideOutContent={<LikelihoodSlideOutContent />}
          title="AI"
        >
          <BsFillQuestionCircleFill
            className="h-5 w-5 pb-1 pl-1 text-gray-400 hover:text-gray-500"
            aria-hidden="true"
          />
        </SlideOutSheet>
      </div>
      <div className="text-7xl font-bold text-purple md:text-9xl">
        {Math.round(ltcLikelihoodEver * 100)}
        <span className={styles.percentSymbol}>%</span>
      </div>
      <div className="text-lg font-normal text-gray-700 md:text-xl">
        National Average: 56%<sup>1</sup>
      </div>
    </div>
  );
}

export function ColumnLtcAtAge() {
  const intakeSurvey = useSelector(selectIntakeSurvey);
  const { ltcAtAge, ltcAtAgeShowRange } = useSelector(
    selectAppliedInferenceSet,
  );
  const client = useSelector(selectClient);

  if (ltcAtAgeShowRange) {
    return null;
  }

  return (
    <div className="flex-grow-1 basis-1/2 text-center">
      <div className="text-xl font-semibold text-darkPurple">
        {startCase(possessivePronoun(intakeSurvey))} care is expected to begin
        at
        <SlideOutSheet
          slideOutContent={<LtcAtAgeSlideOutContent />}
          title="AI"
        >
          <BsFillQuestionCircleFill
            className="h-5 w-5 pb-1 pl-1 text-gray-400 hover:text-gray-500"
            aria-hidden="true"
          />
        </SlideOutSheet>
      </div>
      <div className="text-7xl font-bold text-purple md:text-9xl">
        {ltcAtAge}
      </div>
      <div className="flex justify-center gap-2 text-lg font-normal text-gray-700 md:text-xl">
        <span className="">years old</span>
        {isInferenceEdited(client, 'ltcAtAge') && (
          <Badge
            color="gray"
            label="edited"
            className="mt-1"
          />
        )}
      </div>
    </div>
  );
}

function ColumnLtcAgeFallBack() {
  const intakeSurvey = useSelector(selectIntakeSurvey);
  const { ltcAtAge, ltcAtAgeShowRange } = useSelector(
    selectAppliedInferenceSet,
  );

  if (!ltcAtAgeShowRange) {
    return null;
  }

  return (
    <div className="flex-grow-1 basis-1/2 text-center">
      <div className="text-xl font-semibold text-darkPurple">
        {startCase(possessivePronoun(intakeSurvey))} care is expected to begin
        at <sup className="font-normal text-gray-600">2</sup>
      </div>
      <div className="text-7xl font-bold text-purple md:text-9xl">
        {ltcAtAge}
      </div>
    </div>
  );
}
