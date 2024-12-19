import {
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  Tooltip,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CustomTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

export function CustomTooltip({
  children,
  content,
  className,
}: CustomTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex items-center justify-start gap-3 hover:cursor-default">
          {children}
        </TooltipTrigger>
        <TooltipContent
          className={cn('m-1 w-auto max-w-80 p-2 text-sm', className)}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
