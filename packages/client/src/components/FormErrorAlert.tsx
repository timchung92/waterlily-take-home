import XCircleIcon from '@heroicons/react/20/solid/XCircleIcon';
import { AlertTriangle } from 'lucide-react';
import { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

interface FormErrorAlertProps {
  mainErrorMessage: string;
  className?: string;
  isWarning?: boolean;
}

export function FormErrorAlert({
  mainErrorMessage,
  children,
  className,
  isWarning = false,
}: PropsWithChildren<FormErrorAlertProps>) {
  if (mainErrorMessage === '') {
    return null;
  }

  const Icon = isWarning ? AlertTriangle : XCircleIcon;
  const baseColors = isWarning ? 'bg-yellow-50' : 'bg-red-50';
  const iconColors = isWarning ? 'text-yellow-400' : 'text-red-400';
  const textColors = isWarning ? 'text-yellow-800' : 'text-red-800';
  const childrenColors = isWarning ? 'text-yellow-700' : 'text-red-700';

  return (
    <div className={cn(`rounded-md ${baseColors} p-3`, className)}>
      <div className="flex items-baseline">
        <div className="flex-shrink-0">
          <Icon
            className={`mt-1 h-4 w-4 translate-y-px ${iconColors}`}
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${textColors}`}>
            {mainErrorMessage}
          </h3>
          {children && (
            <div className={`mt-2 text-sm ${childrenColors}`}>
              <ul className="list-disc space-y-1 pl-5">{children}</ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
