import { PlusIcon } from 'lucide-react';
import {
  COMPLETED_REVIEW_TOGETHER,
  STARTED_REVIEW_TOGETHER,
  USER_AVAILABLE_STATUS_TAGS,
  putClientByClientIdRequest,
  putClientOnboardingSlideProgressByClientIdRequest,
} from '..';
import { useDispatch } from 'react-redux';
import { newUuid } from '@shared';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface StatusTagMenuProps {
  clientTags: string[];
  client: Client;
}

export default function StatusTagMenu({
  clientTags,
  client,
}: StatusTagMenuProps) {
  const dispatch = useDispatch();
  const tagOptions = USER_AVAILABLE_STATUS_TAGS.filter(
    availableTag => !clientTags.includes(availableTag),
  );
  const onboardingSlideProgress = client.onboardingSlideProgress;

  if (tagOptions.length === 0) {
    return null;
  }

  const addStatusToClientTags = (statusTag: string) => {
    const clientOnboardingSlideProgressId =
      onboardingSlideProgress?.clientOnboardingSlideProgressId ?? newUuid();
    const newTags = [...clientTags.filter(tag => tag), statusTag];

    dispatch(
      putClientByClientIdRequest({
        ...client,
        clientTags: newTags,
      }),
    );

    if (statusTag === STARTED_REVIEW_TOGETHER) {
      dispatch(
        putClientOnboardingSlideProgressByClientIdRequest({
          clientOnboardingSlideProgressId,
          clientId: client.clientId,
          hasClientStartedOnboarding: true,
        }),
      );
    }

    if (statusTag === COMPLETED_REVIEW_TOGETHER) {
      dispatch(
        putClientOnboardingSlideProgressByClientIdRequest({
          clientOnboardingSlideProgressId,
          clientId: client.clientId,
          hasClientCompletedOnboarding: true,
        }),
      );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex items-center gap-1 py-0.5 text-gray-600"
        >
          <span className="">Add Status</span>
          <PlusIcon className="h-4 w-4 " />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64"
      >
        {tagOptions.map((tag, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => addStatusToClientTags(tag)}
            className="w-full px-4 py-2 text-sm"
          >
            {tag}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
