import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { AlertDialog } from "../core/alert-dialog";
import { AlertDialogAction, AlertDialogCancel } from "../ui/alert-dialog";
import { Trans, useTranslation } from "react-i18next";

interface Props {
  currentStoryTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onDontSave: () => void;
}

export function NewStoryAlertDialog({ currentStoryTitle, open, onOpenChange, onSave, onDontSave }: Props) {
  const { t } = useTranslation();

  return (
    <AlertDialog
      title={t("Save the current story?")}
      description={(
        <Trans
          i18nKey="dialogs.newStory"
          values={{ currentStoryTitle }}
          components={[ <Badge variant="secondary" /> ]}
        >
          Otherwise, all changes to the current story {<Badge variant="secondary">{currentStoryTitle}</Badge>} will be lost.
        </Trans>
      )}
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogCancel>
        {t("Cancel")}
      </AlertDialogCancel>
      <AlertDialogAction asChild>
        <Button onClick={onSave}>
          {t("Save")}
        </Button>
      </AlertDialogAction>
      <AlertDialogAction asChild>
        <Button variant="destructive" onClick={onDontSave}>
          {t("Don't save")}
        </Button>
      </AlertDialogAction>
    </AlertDialog>
  );
}
