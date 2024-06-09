import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { AlertDialog } from "../core/alert-dialog";
import { AlertDialogAction, AlertDialogCancel } from "../ui/alert-dialog";

interface Props {
  currentStoryTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onDontSave: () => void;
}

export function NewStoryAlertDialog({ currentStoryTitle, open, onOpenChange, onSave, onDontSave }: Props) {
  return (
    <AlertDialog
      title="Save the current story?"
      description={(
        <>
          Otherwise, all changes to the current story {currentStoryTitle && <Badge variant="secondary">{currentStoryTitle}</Badge>} will be lost.
        </>
      )}
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction asChild>
        <Button onClick={onSave}>
          Save
        </Button>
      </AlertDialogAction>
      <AlertDialogAction asChild>
        <Button variant="destructive" onClick={onDontSave}>
          Don't save
        </Button>
      </AlertDialogAction>
    </AlertDialog>
  );
}
