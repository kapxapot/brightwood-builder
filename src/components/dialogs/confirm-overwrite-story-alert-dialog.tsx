import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { AlertDialog } from "../core/alert-dialog";
import { AlertDialogAction, AlertDialogCancel } from "../ui/alert-dialog";
import { truncateId } from "@/lib/common";
import { Trans, useTranslation } from "react-i18next";

type Props = {
  storyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ConfirmOverwriteStoryAlertDialog({ storyId, open, onOpenChange, onConfirm }: Props) {
  const { t } = useTranslation();

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("Overwrite the existing story?")}
      description={(
        <>
          <Trans
            i18nKey="dialogs.overwriteStory"
            values={{
              storyId: truncateId(storyId)
            }}
            components={[<Badge variant="secondary" />]}
          >
            A story with the same id <Badge variant="secondary">{truncateId(storyId)}...</Badge> already exists.
          </Trans>
          <br />
          {t("Are you sure you intend to overwrite it?")}
        </>
      )}
    >
      <AlertDialogCancel>
        {t("Cancel")}
      </AlertDialogCancel>
      <AlertDialogAction asChild>
        <Button variant="destructive" onClick={onConfirm}>
          {t("Overwrite")}
        </Button>
      </AlertDialogAction>
    </AlertDialog>
  );
}
