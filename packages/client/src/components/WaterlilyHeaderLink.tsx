import { Link } from 'react-router-dom';
import { AdvisorDashboard, PageLink } from '..';

type WaterlilyHeaderLinkProps = {
  topMargin?: number;
  leftMargin?: number;
  toAdvisorDashboard?: boolean;
};
export function WaterlilyHeaderLink({
  topMargin = 4,
  leftMargin = 4,
  toAdvisorDashboard = false,
}: WaterlilyHeaderLinkProps) {
  return toAdvisorDashboard ? (
    <>
      <PageLink
        to={AdvisorDashboard}
        targetProps={{ advisorId: '' }}
      >
        <div
          className={`ml-${leftMargin} mt-${topMargin} text-2xl font-semibold text-darkPurple md:text-3xl`}
        >
          Waterlily
        </div>
      </PageLink>
    </>
  ) : (
    <Link
      to="https://www.joinwaterlily.com/"
      target="_blank"
    >
      <div
        className={` ml-${leftMargin} mt-${topMargin} text-2xl font-semibold text-darkPurple md:text-3xl`}
      >
        Waterlily
      </div>
    </Link>
  );
}
