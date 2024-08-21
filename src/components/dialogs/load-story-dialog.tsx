import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { isEmpty, truncateId } from "@/lib/common";
import { Button } from "../ui/button";
import Tooltip from "../core/tooltip";
import { ArrowUpTrayIcon, NoSymbolIcon, TrashIcon } from "@heroicons/react/24/outline";
import { StoryShortcut } from "@/entities/story";
import { ConfirmDeleteStoryAlertDialog } from "./confirm-delete-story-alert-dialog";
import { fetchCurrentStoryId } from "@/lib/storage";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { focus } from "@/lib/ref-operations";

type Props = {
  stories: StoryShortcut[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadStory: (id: string) => void;
  onDeleteStory: (id: string) => void;
}

const MotionButton = motion(Button);

export function LoadStoryDialog({ stories, open, onOpenChange, onLoadStory, onDeleteStory }: Props) {
  const { t } = useTranslation();

  const currentStoryId = fetchCurrentStoryId();
  const isCurrent = (story: StoryShortcut) => story.id === currentStoryId;

  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => focus(closeRef), []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("loadStoryTitle")}</DialogTitle>
          <DialogDescription>
            {t("Choose a story to load. You can also delete stories here.")}
          </DialogDescription>
        </DialogHeader>
        {isEmpty(stories) && (
          <div className="flex justify-center items-center gap-1">
            <NoSymbolIcon className="w-6 text-red-600" />
            <span>{t("There are no saved stories yet.")}</span>
          </div>
        )}
        {!isEmpty(stories) && (
          <div className="flex flex-col gap-1">
            {stories.map(story => (
              <div
                className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded"
                key={story.id}
              >
                <div className="flex-grow">
                  {story.title && (
                    <div>{story.title}</div>
                  )}
                  <div className="text-xs text-gray-400">{story.id}</div>
                </div>
                <div className="flex gap-2">
                  <Tooltip tooltip={t("Load story")} side="top">
                    <MotionButton
                      variant="outlineHighlight"
                      size="icon"
                      onClick={() => onLoadStory(story.id)}
                      initial={{ scale: 1 }}
                      animate={{ scale: 1 }}
                      whileHover={{
                        scale: 1.2
                      }}
                    >
                      <ArrowUpTrayIcon className="w-5" />
                    </MotionButton>
                  </Tooltip>
                  {isCurrent(story) && (
                    <Tooltip tooltip={t("Can't delete the current story")} side="top">
                      <motion.div
                        className="h-9 w-9 inline-flex items-center justify-center"
                        initial={{ scale: 1 }}
                        animate={{ scale: 1 }}
                        whileHover={{
                          scale: 1.2
                        }}
                      >
                        <TrashIcon className="w-5 text-gray-400 cursor-not-allowed" />
                      </motion.div>
                    </Tooltip>
                  )}
                  {!isCurrent(story) && (
                    <Tooltip tooltip={t("Delete story")} side="top">
                      <ConfirmDeleteStoryAlertDialog
                        onConfirm={() => onDeleteStory(story.id)}
                        storyName={story.title ?? `${truncateId(story.id)}...`}
                        trigger={(
                          <MotionButton
                            variant="ghost"
                            size="icon"
                            initial={{ scale: 1 }}
                            animate={{ scale: 1 }}
                            whileHover={{
                              scale: 1.2
                            }}
                          >
                            <TrashIcon className="w-5 text-red-600" />
                          </MotionButton>
                        )}
                      />
                    </Tooltip>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button ref={closeRef} variant="outline">
              {t("Close")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
