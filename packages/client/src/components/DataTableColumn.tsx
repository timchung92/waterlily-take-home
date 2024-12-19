import { Column } from '@tanstack/react-table';
import { Button } from './ui/button';
import { ArrowUpDown } from 'lucide-react';

import { cn } from '..';

export function renderTableCell(
  children: string | React.ReactNode,
  className?: string,
) {
  return (
    <div
      className={cn('flex justify-start font-medium text-gray-600', className)}
    >
      {children}
    </div>
  );
}

export function renderHeaderCell(
  children: string | React.ReactNode,
  className?: string,
) {
  return (
    <div
      className={cn(
        'flex justify-start whitespace-nowrap font-medium text-gray-800',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SortHeader<TData>({
  column,
  children,
  variant = 'ghost',
}: {
  column: Column<TData, any>;
  children: string | React.ReactNode;
  variant?: 'link' | 'ghost';
}) {
  return (
    <div className="flex items-center gap-0">
      <span className="whitespace-nowrap">{children}</span>
      <Button
        variant={variant}
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className={`ml-0.5 p-2 font-medium text-gray-500 ${variant === 'link' ? 'p-1.5 hover:text-gray-900' : ''}`}
      >
        <ArrowUpDown
          strokeWidth={1.5}
          size={12}
        />
      </Button>
    </div>
  );
}
