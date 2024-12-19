import { MoreHorizontal, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import React from 'react';

interface ActionMenuProps {
  actions: JSX.Element[];
  disabled?: boolean;
  className?: string;
}

export function FundingSourceActionMenu({
  actions,
  disabled,
  className,
}: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'h-8 w-8 p-0 text-gray-700 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
            className,
          )}
          disabled={disabled}
        >
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4 " />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ActionMenu actions={actions} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ActionMenu({ actions }: { actions: React.ReactNode[] }) {
  return (
    <>
      {actions.map((action, index) => (
        <React.Fragment key={index}>{action}</React.Fragment>
      ))}
    </>
  );
}

interface EditActionProps {
  onClick: (open: boolean) => void;
}

export function EditAction(props: EditActionProps) {
  return (
    <DropdownMenuItem
      onClick={() => props.onClick(true)}
      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm"
    >
      <span>Edit</span>
    </DropdownMenuItem>
  );
}

interface DeleteActionProps {
  onClick: (removeFundingSource: any) => void;
}

export function DeleteAction(props: DeleteActionProps) {
  return (
    <DropdownMenuItem
      onClick={props.onClick}
      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-500"
    >
      <span>Delete</span>
    </DropdownMenuItem>
  );
}
