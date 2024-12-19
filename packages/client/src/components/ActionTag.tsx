import { Tooltip } from '@mui/material';
import {
  ACTION_TAG_TOOLTIPS,
  ALGORITHMS_ERROR,
  CLIENT_COMPLETED_REVIEW,
  COMPLETED_REVIEW_TOGETHER,
  REVIEW_CALL_SCHEDULED,
  CLIENT_STARTED_REVIEW,
  STARTED_REVIEW_TOGETHER,
  USER_AVAILABLE_STATUS_TAGS,
  INTAKE_FORM_INCOMPLETE,
  STARTED_INTAKE_FORM,
  REQUESTED_MEETING,
  INITIAL_CONTACT_MADE,
  REPRESENTATIVE_ASSIGNED,
} from '../util/constants';
import {
  ALGORITHMS_CURRENTLY_RUNNING,
  ALGORITHMS_FINISHED_RUNNING,
  START_ONBOARDING,
} from '../util/constants';
import { useDispatch } from 'react-redux';
import {
  putClientByClientIdRequest,
  putClientOnboardingSlideProgressByClientIdRequest,
} from '..';
import { newUuid } from '@shared';

interface ActionTagsProps {
  className?: string;
  clientTag: string;
  client: Client;
}

const BgColorByClientTag = {
  [ALGORITHMS_CURRENTLY_RUNNING]: 'bg-gray-100',
  [ALGORITHMS_FINISHED_RUNNING]: 'bg-amber-100',
  [ALGORITHMS_ERROR]: 'bg-red-100',
  [CLIENT_STARTED_REVIEW]: 'bg-indigo-100',
  [CLIENT_COMPLETED_REVIEW]: 'bg-emerald-100',
  [STARTED_REVIEW_TOGETHER]: 'bg-blue-100',
  [COMPLETED_REVIEW_TOGETHER]: 'bg-green-100',
  [REVIEW_CALL_SCHEDULED]: 'bg-fuchsia-100',
  [INTAKE_FORM_INCOMPLETE]: 'bg-stone-100',
  [START_ONBOARDING]: 'bg-orange-100',
  [STARTED_INTAKE_FORM]: 'bg-blue-100',
  [REQUESTED_MEETING]: 'bg-rose-100',
  [REPRESENTATIVE_ASSIGNED]: 'bg-yellow-100',
  [INITIAL_CONTACT_MADE]: 'bg-sky-100',
};

const deletableTags = [
  ...USER_AVAILABLE_STATUS_TAGS,
  ALGORITHMS_FINISHED_RUNNING,
  START_ONBOARDING,
  REQUESTED_MEETING,
];

export function ActionTag({ className, clientTag, client }: ActionTagsProps) {
  const dispatch = useDispatch();
  const onboardingSlideProgress = client.onboardingSlideProgress;

  const removeActionTag = (statusTag: string) => {
    const clientOnboardingSlideProgressId =
      onboardingSlideProgress?.clientOnboardingSlideProgressId ?? newUuid();
    const newTags = [
      ...client.clientTags.filter(tag => tag && tag !== statusTag),
    ];
    dispatch(
      putClientByClientIdRequest({
        ...client,
        clientTags: newTags,
      }),
    );
    // If the client removes onboarding started together status, we need to update the slide progress
    if (statusTag === STARTED_REVIEW_TOGETHER) {
      dispatch(
        putClientOnboardingSlideProgressByClientIdRequest({
          clientOnboardingSlideProgressId,
          clientId: client.clientId,
          hasClientStartedOnboarding: false,
        }),
      );
    }
    // If the client removes onboard completed together status, we need to update the slide progress
    if (statusTag === COMPLETED_REVIEW_TOGETHER) {
      dispatch(
        putClientOnboardingSlideProgressByClientIdRequest({
          clientOnboardingSlideProgressId,
          clientId: client.clientId,
          hasClientCompletedOnboarding: false,
        }),
      );
    }
  };

  return (
    <Tooltip
      key={clientTag}
      title={<span className="text-sm">{ACTION_TAG_TOOLTIPS[clientTag]}</span>}
    >
      <span
        key={clientTag}
        className={`m-1 inline-flex items-center rounded-md  py-1 pl-3 pr-2 text-sm font-medium text-gray-900 ${BgColorByClientTag[clientTag]}`}
      >
        {/* <span className="mr-1">{IconsByClientTag[clientTag]}</span> */}
        <span className="mr-1">{clientTag}</span>
        {deletableTags.includes(clientTag) && (
          <button
            onClick={() => removeActionTag(clientTag)}
            type="button"
            className="ml-1 inline-flex h-4 w-4 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-300 hover:text-gray-500"
          >
            <span className="sr-only">Remove status for {clientTag}</span>
            <svg
              className="h-2 w-2"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 8 8"
            >
              <path
                strokeLinecap="round"
                strokeWidth="1.5"
                d="M1 1l6 6m0-6L1 7"
              />
            </svg>
          </button>
        )}
      </span>
    </Tooltip>
  );
}
