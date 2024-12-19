import { useDispatch, useSelector } from 'react-redux';
import {
  SlideOutSheet,
  OnboardingChrome,
  ResultsAreInSlideOutContent,
  citations,
} from '../components';
import {
  putClientOnboardingSlideProgressByClientIdRequest,
  selectClient,
  selectClientOnboardingSlideProgress,
  selectSession,
} from '../model';
import advisorImageUrl from '../images/OnboardingResultsAreIn.png';
import styles from './OnboardingResultsAreIn.module.css';
import { SlideContent } from '../components/SlideContent';
import { OnboardingOurPredictions, OnboardingCostFactors } from '../pages';
import { useEffect } from 'react';
import { SessionType, newUuid } from '@shared';
import { CLIENT_STARTED_REVIEW } from '..';

export function OnboardingResultsAreIn({ clientId }: ClientIdProps) {
  const client = useSelector(selectClient)!;
  const {
    clientFirstName,
    intakeSurvey: { clientHasStartedLtc },
  } = client;

  const dispatch = useDispatch();

  const onboardingSlideProgress = useSelector(
    selectClientOnboardingSlideProgress,
  );

  const { sessionType } = useSelector(selectSession);

  useEffect(() => {
    if (
      (onboardingSlideProgress &&
        onboardingSlideProgress.hasClientStartedOnboarding) ||
      sessionType !== SessionType.client
    ) {
      return;
    }
    const clientOnboardingSlideProgressId =
      onboardingSlideProgress?.clientOnboardingSlideProgressId ?? newUuid();
    const updateClientTags = [...client.clientTags, CLIENT_STARTED_REVIEW];
    dispatch(
      putClientOnboardingSlideProgressByClientIdRequest({
        clientOnboardingSlideProgressId,
        clientId,
        hasClientStartedOnboarding: true,
        clientTags: updateClientTags,
      }),
    );
  }, [
    dispatch,
    clientId,
    onboardingSlideProgress?.hasClientStartedOnboarding,
    onboardingSlideProgress?.clientOnboardingSlideProgressId,
  ]);

  return (
    <OnboardingChrome
      slidePage={OnboardingResultsAreIn}
      nextButtonLabel={
        clientHasStartedLtc
          ? `See ${clientFirstName}'s Costs`
          : `Check Out ${clientFirstName}'s Numbers`
      }
      nextSlidePage={
        clientHasStartedLtc ? OnboardingCostFactors : OnboardingOurPredictions
      }
      citations={[citations.OnboardingResultsAreInDisclaimer]}
    >
      <SlideContent headerText={`${clientFirstName}'s results are in!`}>
        <div className="mt-8 grid gap-y-8 sm:grid-cols-1 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:max-h-12">
            <img
              src={advisorImageUrl}
              className="max-w-[18em] rounded-3xl shadow-xl md:max-w-[22em]"
              alt="Results are in"
            />
          </div>
          <div className="flex flex-col gap-6 text-base leading-normal tracking-wide md:text-2xl md:leading-9">
            <div>
              {clientFirstName}&apos;s long-term care predictions that follow
              are made using{' '}
              <span className={styles.emphasizedTextBold}>
                artificial intelligence (AI)
              </span>{' '}
              by comparing {clientFirstName}&apos;s information with similar
              data from nearly{' '}
              <span className={styles.emphasizedTextBold}>50,000</span>{' '}
              families.
            </div>
            <div>
              We draw from a dataset with over{' '}
              <span className={styles.emphasizedTextBold}>500,000,000</span>{' '}
              data points to personalize {clientFirstName}&apos;s predictions.{' '}
              <SlideOutSheet
                slideOutContent={
                  <ResultsAreInSlideOutContent
                    clientFirstName={clientFirstName}
                  />
                }
                title="FAQ"
              >
                <span className="ml-1 w-full text-left font-normal underline hover:text-purple">
                  Learn more
                </span>
              </SlideOutSheet>{' '}
              about our data and methodology.
            </div>
            <div className="flex-grow"></div> {/* Spacer div */}
          </div>
        </div>
      </SlideContent>
    </OnboardingChrome>
  );
}
