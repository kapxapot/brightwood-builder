import { PropsWithChildren, ReactNode } from "react";
import { AlertDialog as ShadAlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogTrigger } from "../ui/alert-dialog";

type Props = {
  title: string;
  description?: ReactNode;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AlertDialog({ title, description, trigger, open, onOpenChange, children }: PropsWithChildren<Props>) {
  return (
    <ShadAlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <AlertDialogTrigger asChild>
          {trigger}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {!!description && (
            <AlertDialogDescription>
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {children}
        </AlertDialogFooter>
      </AlertDialogContent>
    </ShadAlertDialog>
  );
}
