import { StoryInfoGraphNode } from "@/entities/story-node";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface Props {
  storyInfo: StoryInfoGraphNode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onDontSave: () => void;
}

export function NewStoryAlertDialog({ storyInfo, open, onOpenChange, onSave, onDontSave }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Save the current story?</AlertDialogTitle>
          <AlertDialogDescription>
            Otherwise, all changes to the current story { storyInfo?.title ? <Badge variant="secondary">{storyInfo.title}</Badge> : "" } will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
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
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
