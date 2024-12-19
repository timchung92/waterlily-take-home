import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface UnsavedChangesDialogProps {
  showWarning: boolean;
  handleCancelClose: () => void;
  handleConfirmClose: () => void;
}

export function UnsavedChangesDialog({
  showWarning,
  handleCancelClose,
  handleConfirmClose,
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog
      open={showWarning}
      onOpenChange={handleCancelClose}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
              <ExclamationTriangleIcon
                className="h-5 w-5 text-red-600"
                aria-hidden="true"
              />
            </div>
            <div className="flex flex-col">
              <AlertDialogTitle className="text-gray-900">
                You have unsaved changes!
              </AlertDialogTitle>
              <AlertDialogDescription className="my-4 text-gray-700">
                If you close this dialog, you will lose all the changes you have
                made. Are you sure you wish to close?
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handleCancelClose}
            className="text-gray-900"
          >
            Don't close
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmClose}
            className="bg-red-500 text-white hover:bg-red-700"
          >
            Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
