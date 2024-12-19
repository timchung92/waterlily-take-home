import { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Citations, citations } from '../components';
import { selectClient, updateOnboardingSlideTracker } from '../model';
import {
  isSelectedSlidesFiltered,
  onboardingSlideByIndex,
  selectSlides,
} from './OnboardingSlideInfo';
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import { ProgressStepper } from './ProgressStepper';
import { OnboardingProgressBar } from './OnboardingProgressBar';
import { TopBannerOnboarding } from './TopBannerOnboarding';
import { OnboardingSlideNavigation } from './OnboardingSlideNavigation';


interface OnboardingChromeProps {
  slidePage: FunctionComponent<ClientIdProps>;
  title?: ReactNode;
  children: ReactNode;
  citations?: (typeof citations)['value'][];
  nextButtonLabel: string;
  nextSlidePage?: FunctionComponent<ClientIdProps>;
  previousSlidePage?: FunctionComponent<ClientIdProps>;
  secondaryNextSlidePage?: FunctionComponent<ClientIdProps>;
  secondaryNextButtonLabel?: string;
  disableNextButton?: boolean;
  errorModalMessage?: string;
  shouldHideNextNavigation?: boolean;
}

export function OnboardingChrome({
  slidePage,
  children,
  citations,
  nextButtonLabel,
  nextSlidePage,
  secondaryNextButtonLabel,
  secondaryNextSlidePage,
  previousSlidePage,
  disableNextButton,
  errorModalMessage,
  shouldHideNextNavigation,
}: OnboardingChromeProps) {
  const client = useSelector(selectClient)!;
  const dispatch = useDispatch();
  const selectedSlides = selectSlides(client);
  const selectedSlidesFiltered = isSelectedSlidesFiltered(selectedSlides);
  const relativeSlideIndex = selectedSlides.indexOf(slidePage);
  const globalSlideIndex = onboardingSlideByIndex.indexOf(slidePage);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  useEffect(() => {
    if (showErrorAlert) {
      setShowErrorAlert(false); // Close the modal
    }
  }, [disableNextButton]);

  useEffect(() => {
    dispatch(updateOnboardingSlideTracker(globalSlideIndex));
  }, [globalSlideIndex]);

  return (
    <div id="top-container">
      {selectedSlidesFiltered && (
        <OnboardingProgressBar
          progressPercentage={
            (relativeSlideIndex / selectedSlides.length) * 100
          }
        />
      )}
      <div className="flex min-h-[800px] flex-col px-8 pb-[88px] pt-4 md:h-screen md:px-20 md:pb-4">
        <TopBannerOnboarding className="pb-5" />

        <ProgressStepper
          client={client}
          slideIndex={globalSlideIndex}
          show={!selectedSlidesFiltered}
        />
        <div className="relative flex-1">{children}</div>
        <Citations
          citations={citations}
          className="py-4"
        />
        <ErrorAlert
          isOpen={showErrorAlert}
          message={errorModalMessage ?? 'Please select an answer to continue'}
        />
        <OnboardingSlideNavigation
          slidePage={slidePage}
          nextButtonLabel={nextButtonLabel}
          nextSlidePage={nextSlidePage}
          secondaryNextSlidePage={secondaryNextSlidePage}
          secondaryNextButtonLabel={secondaryNextButtonLabel}
          previousSlidePage={previousSlidePage}
          disableNextButton={disableNextButton}
          shouldHideNextNavigation={shouldHideNextNavigation}
          setShowErrorAlert={setShowErrorAlert}
          className="fixed bottom-0 left-0 right-0 bg-white p-5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:relative  md:my-4 md:border-0 md:bg-transparent md:p-0 md:pb-5 md:pr-0 md:shadow-none"
        />
      </div>
    </div>
  );
}

interface ErrorAlertProps {
  isOpen: boolean;
  message: string;
}

const ErrorAlert = ({ isOpen, message }: ErrorAlertProps) => {
  if (!isOpen) return null;

  return (
    <div className="my-4 border-l-4 border-yellow-400 bg-yellow-50 p-2">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon
            className="h-5 w-5 text-yellow-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <p className="text-base text-yellow-700">{message}</p>
        </div>
      </div>
    </div>
  );
};
