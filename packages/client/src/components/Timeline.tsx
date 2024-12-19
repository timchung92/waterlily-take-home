import { cn } from '..';

interface TimelineItem {
  title: string;
  date: string;
  description: string;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const CalendarIcon: React.FC = () => (
  <svg
    className="h-2.5 w-2.5 text-blue-800"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
  </svg>
);

const TimelineItemComponent: React.FC<TimelineItem & { isLast?: boolean }> = ({
  title,
  date,
  description,
  isLast = false,
}) => (
  <li className="relative mb-6 w-full sm:mb-0">
    <div className="flex items-center">
      <div className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 ring-0 ring-white sm:ring-8">
        <CalendarIcon />
      </div>
      <div className="hidden h-0.5 w-full bg-gray-200 sm:flex" />
    </div>
    <div className="mt-3 sm:pe-8">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <time className="mb-2 block text-sm font-normal leading-none text-gray-400">
        {date}
      </time>
      <p className="text-base font-normal text-gray-500">{description}</p>
    </div>
  </li>
);

const Timeline: React.FC<TimelineProps> = ({ items, className }) => (
  <ol className={cn(`items-center sm:flex`, className)}>
    {items.map((item, index) => (
      <TimelineItemComponent
        key={index}
        {...item}
        isLast={index === items.length - 1}
      />
    ))}
  </ol>
);

export default Timeline;
