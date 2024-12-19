import { OnboardingChrome } from '..';

export function OnboardingEvaluatePolicyCoverage({ clientId }: ClientIdProps) {
  return (
    <OnboardingChrome
      slidePage={OnboardingEvaluatePolicyCoverage}
      nextButtonLabel="Download My Plan"
    >
      <div className="flex h-full w-full flex-col justify-center">
        <div className="flex w-full justify-center">
          <h1 className="mx-auto w-[90%] text-xl font-semibold leading-tight text-darkPurple md:w-[70%] md:text-4xl">
            We've sent an email to your advisor to help you evaluate policy quotes or
            financial products that offer additional coverage for your
            personalized LTC trajectory.
          </h1>
        </div>
      </div>
    </OnboardingChrome>
  );
}
