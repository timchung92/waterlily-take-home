import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { PageLink, HrefLink } from '../components';
import { selectClient } from '../model';
import { selectSlides } from './OnboardingSlideInfo';
import { cn, OnboardingDownloadReport } from '..';
import { Button } from './ui/button';
import { ChevronRightIcon } from 'lucide-react';

const NAV_BUTTON_STYLE =
  'max-h-16 md:min-w-32 rounded-full px-6 py-4 text-base text-white md:px-8 md:py-6 md:text-lg';

type OnboardingSlideNavigationProps = {
  slidePage: FunctionComponent<ClientIdProps>;
  nextButtonLabel: string;
  nextSlidePage?: FunctionComponent<ClientIdProps>;
  secondaryNextSlidePage?: FunctionComponent<ClientIdProps>;
  secondaryNextButtonLabel?: string;
  previousSlidePage?: FunctionComponent<ClientIdProps>;
  disableNextButton?: boolean;
  shouldHideNextNavigation?: boolean;
  setShowErrorAlert: (showErrorAlert: boolean) => void;
  className?: string;
};

export function OnboardingSlideNavigation({
  slidePage,
  shouldHideNextNavigation,
  disableNextButton,
  nextButtonLabel,
  nextSlidePage,
  secondaryNextSlidePage,
  secondaryNextButtonLabel,
  previousSlidePage,
  setShowErrorAlert,
  className,
}: OnboardingSlideNavigationProps) {
  const client = useSelector(selectClient)!;

  const {
    clientFirstName,
    clientLastName,
    clientId,
    clientEmail,
    advisorId,
    surveys,
  } = client;

  const selectedSlides = selectSlides(client);
  const relativeSlideIndex = selectedSlides.indexOf(slidePage);
  const surveyId = getLastSurveyId(surveys);
  const feedbackSurveyUrl = `https://waterlily.typeform.com/to/m4H0GpSY#consumer_email=${clientEmail}&consumer_first_name=${clientFirstName}&advisor_id=${advisorId}&survey_id=${surveyId}&organization_name=xxxxx&consumer_last_name=${clientLastName}`;

  const handleNextButtonClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    if (disableNextButton) {
      e.preventDefault(); // Prevent link navigation
      setShowErrorAlert(true);
    }
  };

  const secondaryNextButton =
    secondaryNextSlidePage && secondaryNextButtonLabel ? (
      <Button
        variant="link"
        size="lg"
        className="flex justify-end self-end pl-1"
      >
        <PageLink
          className="flex items-center gap-1 "
          to={secondaryNextSlidePage}
          targetProps={{ clientId }}
        >
          {secondaryNextButtonLabel}
          <ChevronRightIcon className="h-6 w-6" />
        </PageLink>
      </Button>
    ) : null;

  const feedbackSurveyNextButton = (
    <HrefLink
      to={feedbackSurveyUrl}
      rel="noopener"
      target="_blank"
      className="mr-auto md:mr-0"
    >
      <Button
        className={cn(
          'flex flex-col items-center gap-2 md:mr-0',
          NAV_BUTTON_STYLE,
        )}
        size="lg"
      >
        {nextButtonLabel}
        {secondaryNextButton}
      </Button>
    </HrefLink>
  );

  const nextSlideButton = (
    <div className="mr-auto flex flex-col items-start gap-1 md:mr-0">
      {secondaryNextButton}
      <PageLink
        className=""
        onClick={handleNextButtonClick}
        style={{ cursor: disableNextButton ? 'not-allowed' : 'pointer' }}
        to={getPrevOrNextSlide(
          selectedSlides,
          slidePage,
          'next',
          nextSlidePage,
        )}
        targetProps={{ clientId }}
      >
        <Button
          className={cn(NAV_BUTTON_STYLE, 'text-white')}
          data-intercom-target="Next Button"
        >
          {nextButtonLabel}
        </Button>
      </PageLink>
    </div>
  );
  const nextButton = shouldHideNextNavigation
    ? null
    : slidePage === OnboardingDownloadReport // If the current slide is the last slide, show the feedback survey button
      ? feedbackSurveyNextButton
      : nextSlideButton;

  const backButton = (
    <PageLink
      to={getPrevOrNextSlide(
        selectedSlides,
        slidePage,
        'prev',
        previousSlidePage,
      )}
      targetProps={{ clientId }}
    >
      <Button
        variant="outline"
        className={cn(NAV_BUTTON_STYLE, 'text-darkPurple ')}
      >
        Back
      </Button>
    </PageLink>
  );

  return (
    <div
      className={cn(
        'flex w-full flex-row-reverse items-end gap-4 md:justify-between md:pr-0',
        className,
      )}
    >
      {nextButton}
      {relativeSlideIndex !== 0 && backButton}
    </div>
  );
}

function getPrevOrNextSlide(
  selectedSlides: FunctionComponent<ClientIdProps>[],
  slidePage: FunctionComponent<ClientIdProps>,
  direction: 'next' | 'prev',
  prevOrNextSlide?: FunctionComponent<ClientIdProps>,
) {
  if (prevOrNextSlide && selectedSlides.includes(prevOrNextSlide)) {
    return prevOrNextSlide;
  }
  const slideIndex = selectedSlides.indexOf(slidePage);
  const prevOrNextIndex = slideIndex + (direction === 'next' ? 1 : -1);
  return selectedSlides[prevOrNextIndex];
}

export function getLastSurveyId(surveys: Survey[]) {
  if (surveys && surveys.length > 0) {
    return surveys[surveys.length - 1].surveyId;
  }
}
