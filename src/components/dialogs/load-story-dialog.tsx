import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { isEmpty, truncateId } from "@/lib/common";
import { Button } from "../ui/button";
import Tooltip from "../core/tooltip";
import { ArrowUpTrayIcon, NoSymbolIcon, TrashIcon } from "@heroicons/react/24/outline";
import { StoryShortcut } from "@/entities/story";
import { ConfirmDeleteStoryAlertDialog } from "./confirm-delete-story-alert-dialog";
import { fetchCurrentStoryId } from "@/lib/storage";

interface Props {
  stories: StoryShortcut[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadStory: (id: string) => void;
  onDeleteStory: (id: string) => void;
}

export function LoadStoryDialog({ stories, open, onOpenChange, onLoadStory, onDeleteStory }: Props) {
  const currentStoryId = fetchCurrentStoryId();
  const isCurrent = (story: StoryShortcut) => story.id === currentStoryId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Load story</DialogTitle>
          <DialogDescription>
            Choose a story to load. You can also delete stories here.
          </DialogDescription>
        </DialogHeader>
        {isEmpty(stories) && (
          <div className="flex justify-center items-center gap-1">
            <NoSymbolIcon className="w-6 text-red-600" />
            <span>There are no saved stories yet.</span>
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
                  <Button variant="outlineHighlight" size="icon" onClick={() => onLoadStory(story.id)}>
                    <Tooltip tooltip="Load story" side="top">
                      <ArrowUpTrayIcon className="w-5" />
                    </Tooltip>
                  </Button>
                  {isCurrent(story) && (
                    <div className="h-9 w-9 inline-flex items-center justify-center">
                      <Tooltip tooltip="Can't delete the current story" side="top">
                        <TrashIcon className="w-5 text-gray-400 cursor-not-allowed" />
                      </Tooltip>
                    </div>
                  )}
                  {!isCurrent(story) && (
                    <ConfirmDeleteStoryAlertDialog
                      onConfirm={() => onDeleteStory(story.id)}
                      storyName={story.title ?? truncateId(story.id)}
                      trigger={(
                        <Button variant="ghost" size="icon">
                          <Tooltip tooltip="Delete story" side="top">
                            <TrashIcon className="w-5 text-red-600" />
                          </Tooltip>
                        </Button>
                      )}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
