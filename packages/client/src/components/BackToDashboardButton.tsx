import { useSelector } from 'react-redux';
import { AdvisorDashboard, cn, PageLink, selectSession } from '..';
import { isNullOrUndefined } from '@shared';
import { IoArrowBackCircleSharp } from 'react-icons/io5';

type BackToDashboardButtonProps = {
  className?: string;
};
export function BackToDashboardButton({
  className,
}: BackToDashboardButtonProps) {
  const session = useSelector(selectSession);
  if (isNullOrUndefined(session.advisor?.advisorId)) {
    return null;
  }

  return (
    <PageLink
      to={AdvisorDashboard}
      targetProps={{ advisorId: session.advisor?.advisorId! }}
      className={cn(
        className,
        'mt-6 flex items-center gap-2 rounded-lg px-2 py-2 text-darkPurple hover:text-mediumPurple hover:underline',
      )}
    >
      <IoArrowBackCircleSharp className="h-6 w-6 text-darkPurple" />
      <span className="text-base text-darkPurple">Back to Dashboard</span>
    </PageLink>
  );
}
