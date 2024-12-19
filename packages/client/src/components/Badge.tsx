import { cn } from '@/lib/utils';

interface BadgeProps {
  color:
    | 'gray'
    | 'red'
    | 'yellow'
    | 'green'
    | 'blue'
    | 'indigo'
    | 'purple'
    | 'pink';
  label: string | React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ color, label, className }) => {
  const colorClasses: {
    [key: string]: { bg: string; text: string; ring: string };
  } = {
    gray: {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      ring: 'ring-gray-500/10',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      ring: 'ring-red-600/10',
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      ring: 'ring-yellow-600/20',
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      ring: 'ring-green-600/20',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      ring: 'ring-blue-700/10',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      ring: 'ring-indigo-700/10',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      ring: 'ring-purple-700/10',
    },
    pink: {
      bg: 'bg-pink-50',
      text: 'text-pink-700',
      ring: 'ring-pink-700/10',
    },
    completed: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      ring: 'ring-green-600/20',
    },
  };
  const { bg, text, ring } = colorClasses[color] || colorClasses.gray; // Default to gray if color is invalid

  return (
    <span
      className={cn(
        `inline-flex items-center rounded-md ${bg} px-1.5 py-0.5 text-xs font-medium ${text} ring-1 ring-inset ${ring}`,
        className,
      )}
    >
      {label}
    </span>
  );
};
