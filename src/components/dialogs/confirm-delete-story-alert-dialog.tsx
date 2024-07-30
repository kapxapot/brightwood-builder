import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { AlertDialog } from "../core/alert-dialog";
import { AlertDialogAction, AlertDialogCancel } from "../ui/alert-dialog";
import { ReactNode } from "react";

interface Props {
  storyName: string;
  trigger: ReactNode;
  onConfirm: () => void;
}

export function ConfirmDeleteStoryAlertDialog({ storyName, trigger, onConfirm }: Props) {
  return (
    <AlertDialog
      title="Delete the story?"
      description={(
        <>
          Are you sure you want to delete the story <Badge variant="secondary">{storyName}</Badge>? All story data will be lost.
        </>
      )}
      trigger={trigger}
    >
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction asChild>
        <Button variant="destructive" onClick={onConfirm}>
          Delete
        </Button>
      </AlertDialogAction>
    </AlertDialog>
  );
}
