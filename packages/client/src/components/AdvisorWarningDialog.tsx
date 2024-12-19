import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function AdvisorWarningDialog({
  children,
  onContinue,
}: {
  children: React.ReactNode;
  onContinue: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-gray-900">
            Viewing Another Advisor's Client
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            Warning: Any changes you make will affect the actual client record
            and be visible to both the client and their primary advisor.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-gray-600">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onContinue}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
