import { loadStories } from "@/lib/storage";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { isEmpty } from "@/lib/common";
import { Button } from "../ui/button";
import Tooltip from "../core/tooltip";
import { ArrowUpTrayIcon, TrashIcon } from "@heroicons/react/24/outline";


interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadStory: (id: string) => void;
  onDeleteStory: (id: string) => void;
}

export function LoadStoryDialog({ open, onOpenChange, onLoadStory, onDeleteStory }: Props) {
  const stories = loadStories();

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
          <div className="text-center">
            There no saved stories yet.
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
                <div className="flex">
                  <Button variant="outlineHighlight" size="icon" onClick={() => onLoadStory(story.id)}>
                    <Tooltip tooltip="Load story" side="top">
                      <ArrowUpTrayIcon className="w-5" />
                    </Tooltip>
                  </Button>
                  <Button variant="ghost" size="icon" disabled={true} onClick={() => onDeleteStory(story.id)}>
                    <Tooltip tooltip="Delete story" side="top">
                      <TrashIcon className="w-5 text-red-600" />
                    </Tooltip>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
