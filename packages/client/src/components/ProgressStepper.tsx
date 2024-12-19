import { PageLink } from '../components';

import {
  OnboardingResultsAreIn,
  OnboardingCostFactors,
  OnboardingCarePhasesSummary,
} from '../pages';
import { onboardingSlideByIndex } from './OnboardingSlideInfo';
import { getFirstCarePhasePage } from '../util/navigationLogic';
import { CgShapeCircle } from 'react-icons/cg';
import { CheckIcon } from '@heroicons/react/20/solid';

interface ProgressStepperProps {
  client: Client;
  slideIndex: number;
  show: boolean;
}

export type StepDef = {
  name: 'Review Results' | 'Personalize Plan' | 'Finance Costs';
  beginningSlideIndex: number;
  lastSlideIndex: number;
};

export function getStepDefs(client: Client): StepDef[] {
  const clientFirstCarePhasePage = getFirstCarePhasePage(client);

  return [
    {
      name: 'Review Results',
      beginningSlideIndex: onboardingSlideByIndex.indexOf(
        OnboardingResultsAreIn,
      ),
      lastSlideIndex: onboardingSlideByIndex.indexOf(OnboardingCostFactors),
    },
    {
      name: 'Personalize Plan',
      beginningSlideIndex: onboardingSlideByIndex.indexOf(
        clientFirstCarePhasePage,
      ),
      lastSlideIndex: onboardingSlideByIndex.indexOf(
        OnboardingCarePhasesSummary,
      ),
    }
  ];
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  client,
  slideIndex,
  show,
}) => {
  if (!show) return null;
  const stepDefs = getStepDefs(client);
  const currentStep = findCurrentStep(stepDefs, slideIndex);

  const renderStep = (step: Step, index: number) => {
    const stepPercentComplete = calcStepPercentComplete(slideIndex, step);
    const isCurrentStep = step === currentStep;
    const isCompleted = stepPercentComplete >= 100 && !isCurrentStep;

    const stepContent = (
      <>
        <ProgressBar percent={isCompleted ? 100 : stepPercentComplete} />
        <div
          className={`flex gap-1 text-xs ${isCurrentStep ? 'font-semibold text-purple hover:text-darkPurple' : 'font-medium text-gray-500'} md:text-sm`}
        >
          {isCompleted && (
            <CheckIcon className="hidden self-center text-green-500 md:flex md:h-4 md:w-4" />
          )}
          {isCurrentStep && (
            <CgShapeCircle className="hidden self-center md:flex" />
          )}
          <span className="hidden md:flex">{`Step ${index + 1}. `}</span>
          <span>{step.name}</span>
        </div>
      </>
    );

    return (
      <li
        key={step.name}
        className="flex-1"
      >
        <PageLink
          to={onboardingSlideByIndex[step.beginningSlideIndex]}
          targetProps={{ clientId: client.clientId }}
          className="group flex flex-col"
        >
          {stepContent}
        </PageLink>
      </li>
    );
  };

  return (
    <nav
      aria-label="Progress"
      className="mx-auto w-full max-w-4xl pb-2"
    >
      <ol className="flex space-x-2 space-y-0 md:space-x-8">
        {stepDefs.map(renderStep)}
      </ol>
    </nav>
  );
};

interface ProgressBarProps {
  percent: number; // Percent of the progress bar to fill
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percent }) => {
  return (
    <div className="mb-2 h-1 w-full rounded-md bg-gray-200">
      <div
        className="h-1 rounded-md bg-purple"
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  );
};

function findCurrentStep(steps: Step[], slideNumber: number): Step | undefined {
  return steps.find(
    step =>
      slideNumber >= step.beginningSlideIndex &&
      slideNumber <= step.lastSlideIndex,
  );
}

interface Step {
  name: string;
  beginningSlideIndex: number;
  lastSlideIndex: number;
}

function calcStepPercentComplete(slideIndex: number, step: Step): number {
  if (slideIndex < step.beginningSlideIndex) return 0;
  if (slideIndex > step.lastSlideIndex) return 100;

  return Math.round(
    ((slideIndex - step.beginningSlideIndex) /
      (step.lastSlideIndex - step.beginningSlideIndex + 1)) *
      100,
  );
}
