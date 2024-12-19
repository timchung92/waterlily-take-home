import { CheckCircleIcon } from '@heroicons/react/20/solid';

type StepProps = {
  step: number;
  stepTitle: string;
  stepDescription: string;
  children: React.ReactNode;
  stepCompleted: boolean;
  prevStepCompleted?: boolean;
};

OrderedSteps.Step = function OrderedStepsStep({
  step,
  children,
  stepCompleted,
  stepDescription,
  stepTitle,
  prevStepCompleted,
}: StepProps) {
  return (
    <div className={`flex flex-col space-y-2 `}>
      <label
        className={`flex  items-center gap-1 text-base ${stepCompleted || prevStepCompleted === false ? 'text-gray-400' : 'font-semibold text-purple'}`}
      >
        <span className="font-semibold">Step {step}.</span> {stepTitle}
        <CheckCircleIcon
          className={`${stepCompleted ? '' : 'hidden'} h-5 w-5 text-green-500`}
        />
      </label>
      <h2
        className={`text-base font-normal ${stepCompleted || prevStepCompleted === false ? 'text-gray-400' : 'text-gray-700'}`}
      >
        {stepDescription}
      </h2>
      <div className={`${!prevStepCompleted && step > 1 ? 'hidden' : ''}`}>
        {children}
      </div>
    </div>
  );
};

type OrderedStepsProps = {
  steps: number[];
  stepTitles: string[];
  stepDescriptions: string[];
  childrens: React.ReactNode[];
  stepsCompleted: boolean[];
};

export function OrderedSteps({
  steps,
  stepTitles,
  stepDescriptions,
  childrens,
  stepsCompleted,
}: OrderedStepsProps) {
  return (
    <div className="my-6 space-y-8">
      {/* Permissions */}
      {steps.map((step, index) => (
        <OrderedSteps.Step
          key={step}
          step={step}
          stepTitle={stepTitles[index]}
          stepDescription={stepDescriptions[index]}
          stepCompleted={stepsCompleted[index]}
          prevStepCompleted={
            index === 0 ? undefined : stepsCompleted[index - 1]
          }
        >
          {childrens[index]}
        </OrderedSteps.Step>
      ))}
    </div>
  );
}
