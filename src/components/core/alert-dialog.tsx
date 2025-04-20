import { forwardRef, PropsWithChildren, ReactNode, Ref } from "react";
import { AlertDialog as ShadAlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogTrigger } from "../ui/alert-dialog";

type Props = {
  title: string;
  description?: ReactNode;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const AlertDialog = forwardRef(({ title, description, trigger, open, onOpenChange, children }: PropsWithChildren<Props>, ref: Ref<HTMLDivElement>) => {
  return (
    <ShadAlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <AlertDialogTrigger asChild>
          {trigger}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent ref={ref}>
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
});

AlertDialog.displayName = "AlertDialog";

export default AlertDialog;
