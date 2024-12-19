import { useDispatch, useSelector } from 'react-redux';
import { OnboardingChrome, getLastSurveyId } from '../components';
import {
  putClientOnboardingSlideProgressByClientIdRequest,
  selectClient,
  selectClientOnboardingSlideProgress,
  selectMagicLinkSession,
  selectSession,
} from '../model';
import styles from './OnboardingDownloadReport.module.css';
import React, { useEffect } from 'react';
import { ContentType } from '@shared/ContentType';
import {
  ApiExError,
  LogLevel,
  SessionType,
  builtEnvironment,
  httpStatusCodes,
  isRunningLocal,
  logMessage,
  newUuid,
} from '@shared';
import LinearDeterminate from '../components/LinearDeterminate';
import { Widget } from '@typeform/embed-react';
import { SlideContent } from '../components/SlideContent';
import { GrDocumentDownload } from 'react-icons/gr';
import { CLIENT_COMPLETED_REVIEW } from '@client';

function handleError(response: Response) {
  const { body, headers, redirected, statusText, type, url } = response;

  const apiEx = new ApiExError(
    response.status.toString(),
    'Error invoking remote API method.',
    {
      response: {
        ...body,
        headers: [...headers.keys()].reduce(
          (map, name) => {
            map[name] = headers.get(name);
            return map;
          },
          {} as ObjectMap<string | null>,
        ),
        redirected,
        statusText,
        type,
        url,
      },
    },
  );

  throw apiEx;
}

interface FeedbackSurveyProps {
  client: Client;
}

const FeedbackSurvey = ({ client }: FeedbackSurveyProps) => {
  const { clientEmail, clientFirstName, clientLastName, advisorId, surveys } =
    client;
  const surveyId = getLastSurveyId(surveys);
  const formId = 'm4H0GpSY';
  return (
    <Widget
      id={formId}
      className={styles.surveyContainer}
      hidden={{
        consumer_email: clientEmail,
        consumer_first_name: clientFirstName,
        advisor_id: advisorId,
        survey_id: surveyId ?? 'xxxxx',
        organization_name: 'xxxxx',
        consumer_last_name: clientLastName,
      }}
    />
  );
};

export function OnboardingDownloadReport({ clientId }: ClientIdProps) {
  const client = useSelector(selectClient)!;
  const [isDownloading, setIsDownloading] = React.useState(false);
  const { cognitoSession, sessionType } = useSelector(selectSession);
  const { token: magicLinkToken } = useSelector(selectMagicLinkSession);
  const dispatch = useDispatch();
  const onboardingSlideProgress = useSelector(
    selectClientOnboardingSlideProgress,
  );
  const authHeader = magicLinkToken
    ? {
        Authorization: `Bearer ${magicLinkToken}`,
      }
    : cognitoSession
      ? {
          Authorization: `Bearer ${cognitoSession.idToken.jwtToken}`,
        }
      : undefined;

  async function getPDF(clientId: string) {
    setIsDownloading(true);
    const origin = new URL(document.URL).origin;
    const env = isRunningLocal() ? 'dev' : builtEnvironment;
    const generateClientPDFUrl = `${origin}/${env}/api/client/${clientId}/client-pdf`;
    const urlResponse = await fetch(generateClientPDFUrl, {
      headers: {
        ...authHeader,
      },
    });

    if (urlResponse.ok) {
      const url = await urlResponse.json();
      const pdfResponse = await fetch(url, {
        headers: {
          Accept: ContentType.PDF,
        },
      });
      if (pdfResponse.ok) {
        return pdfResponse;
      }
      handleError(pdfResponse);
    }
    handleError(urlResponse);
  }

  const savePDF = () => {
    return getPDF(clientId)
      .then(async response => {
        if (!response) {
          throw new Error('No response from server');
        }
        const blob = new Blob([await response.blob()], {
          type: 'application/pdf',
        });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${client.clientFirstName}-${client.clientLastName}-LTC-report-${new Date().toISOString()}.pdf`;
        link.click();
      })
      .catch(err => {
        const apiEx =
          err instanceof ApiExError
            ? err
            : new ApiExError(
                httpStatusCodes.clientSideError,
                'Error invoking remote API method.',
                {},
                err,
              );
        logMessage({
          time: new Date(),
          level: LogLevel.error,
          source: OnboardingDownloadReport,
          staticMessage: apiEx.message,
          metadata: {},
          error: apiEx,
        });
      })
      .finally(() => {
        setIsDownloading(false);
      });
  };

  useEffect(() => {
    if (
      (onboardingSlideProgress &&
        onboardingSlideProgress.hasClientCompletedOnboarding) ||
      sessionType !== SessionType.client
    ) {
      return;
    }
    const clientOnboardingSlideProgressId =
      onboardingSlideProgress?.clientOnboardingSlideProgressId ?? newUuid();
    const updatedClientTags = [...client.clientTags, CLIENT_COMPLETED_REVIEW];
    dispatch(
      putClientOnboardingSlideProgressByClientIdRequest({
        clientOnboardingSlideProgressId,
        clientId,
        hasClientCompletedOnboarding: true,
        clientTags: updatedClientTags,
      }),
    );
  }, [clientId, dispatch]);

  return (
    <OnboardingChrome
    slidePage={OnboardingDownloadReport}
    nextButtonLabel="How did we do?"
    >
      <SlideContent headerText="Download your report and share how we did">
        <div className="mt-8 flex w-full flex-col gap-1 md:flex-row-reverse">
          <div className="mb-4 flex flex-col items-center">
            <>
              {isDownloading ? (
                <div className={styles.downloadingProgress}>
                  Downloading... <LinearDeterminate />
                </div>
              ) : (
                <button
                  onClick={savePDF}
                  className="mb-4 mt-8 flex w-full cursor-pointer items-center justify-center rounded-full border-2 border-darkPurple bg-darkPurple px-4 py-2 text-xl text-white hover:bg-white hover:text-darkPurple md:mb-0 md:border md:bg-white md:text-lg  md:text-darkPurple"
                  disabled={isDownloading}
                  style={{ cursor: isDownloading ? 'progress' : 'pointer' }}
                >
                  Download Report
                  <GrDocumentDownload className="ml-2" />
                </button>
              )}
            </>
          </div>
          <div className="mt-4 hidden flex-grow md:flex md:min-h-[500px]">
            <FeedbackSurvey client={client} />
          </div>
        </div>
      </SlideContent>
    </OnboardingChrome>
  );
}
