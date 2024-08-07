import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { AlertDialog } from "../core/alert-dialog";
import { AlertDialogAction, AlertDialogCancel } from "../ui/alert-dialog";
import { truncateId } from "@/lib/common";

interface Props {
  storyId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ConfirmOverwriteStoryAlertDialog({ storyId, open, onOpenChange, onConfirm }: Props) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Overwrite the existing story?"
      description={(
        <>
          A story with the same id {storyId && <Badge variant="secondary">{truncateId(storyId)}...</Badge>} already exists.<br />
          Are you sure you intend to overwrite it?
        </>
      )}
    >
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction asChild>
        <Button variant="destructive" onClick={onConfirm}>
          Overwrite
        </Button>
      </AlertDialogAction>
    </AlertDialog>
  );
}
