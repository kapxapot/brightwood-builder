import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { AlertDialog } from "../core/alert-dialog";
import { AlertDialogAction, AlertDialogCancel } from "../ui/alert-dialog";
import { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";

type Props = {
  storyName: string;
  trigger: ReactNode;
  onConfirm: () => void;
}

export function ConfirmDeleteStoryAlertDialog({ storyName, trigger, onConfirm }: Props) {
  const { t } = useTranslation();

  return (
    <AlertDialog
      title={t("Delete the story?")}
      description={(
        <Trans
          i18nKey="dialogs.deleteStory"
          values={{ storyName }}
          components={[<Badge variant="secondary" />]}
        >
          Are you sure you want to delete the story <Badge variant="secondary">{storyName}</Badge>? All story data will be lost.
        </Trans>
      )}
      trigger={trigger}
    >
      <AlertDialogCancel>
        {t("Cancel")}
      </AlertDialogCancel>
      <AlertDialogAction asChild>
        <Button variant="destructive" onClick={onConfirm}>
          {t("Delete")}
        </Button>
      </AlertDialogAction>
    </AlertDialog>
  );
}
