import { useSelector } from 'react-redux';
import { OnboardingChrome } from '../components';
import { selectClient } from '../model';
import { formatCurrency, formatPercent } from '@shared';

import { SlideContent } from '../components/SlideContent';

export function OnboardingReducedCostConfirmation({ clientId }: ClientIdProps) {
  const client = useSelector(selectClient)!;
  const costSavings = '$X,XXX';
  const hoursMovedToFamily = 'X,XXX';

  return (
    <OnboardingChrome
      slidePage={OnboardingReducedCostConfirmation}
      nextButtonLabel="Cost Breakdown"
    >
      <SlideContent headerText={''}>
        <div className="mt-16 flex h-full w-full flex-col items-center justify-center">
          <h1 className="text-2xl font-semibold md:text-4xl">
            We moved {hoursMovedToFamily} hours of your care from professional
            caregivers to your family, reducing your projected costs by{' '}
            {costSavings}.
          </h1>
        </div>
      </SlideContent>
    </OnboardingChrome>
  );
}
