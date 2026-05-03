import { type DragEvent, useEffect, useRef, useState } from "react";
import Button from "../core/button";
import { autoHeight, focus } from "../../lib/ref-operations";
import { Delete, DragHandle, Edit } from "../core/icons";
import { TextInputLabel } from "../core/text-input-label";
import { useCharLimit } from "@/hooks/use-char-limit";
import { useTranslation } from "react-i18next";
import TextDisplay from "../core/text-display";
import { extractImageUrl } from "@/lib/url";
import { ImageDisplay } from "../core/image-display";
import { cn } from "@/lib/utils";

type Props = {
  line: string;
  index: number;
  deletable: boolean;
  expanded?: boolean;
  readonly?: boolean;
  charLimit?: number;
  reorderable?: boolean;
  isDragging?: boolean;
  isDropTarget?: boolean;
  dropTargetClassName?: string;
  updateLine: (updatedLine: string) => void;
  deleteLine: () => void;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnter: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onEditStarted: () => void;
  onEditFinished: () => void;
};

export default function NodeTextLine({
  line,
  index,
  deletable,
  expanded = false,
  readonly,
  charLimit = 0,
  reorderable = false,
  isDragging = false,
  isDropTarget = false,
  dropTargetClassName,
  updateLine,
  deleteLine,
  onDragStart,
  onDragEnter,
  onDragOver,
  onDrop,
  onDragEnd,
  onEditStarted,
  onEditFinished
}: Props) {
  const { t } = useTranslation();

  const virgin = !line.length;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dragPreviewRef = useRef<HTMLDivElement>(null);

  const [editedLine, setEditedLine] = useState(line);
  const [editing, setEditing] = useState(virgin);
  const { showCharLimit, valueTooLong} = useCharLimit(editedLine, charLimit);

  function startEdit() {
    if (readonly) {
      return;
    }

    setEditedLine(line);
    setEditing(true);
    onEditStarted();

    focus(inputRef);
  }

  function cancelEdit() {
    setEditing(false);
    onEditFinished();

    if (!virgin) {
      setEditedLine(line);
    } else if (deletable) {
      deleteLine();
    }
  }

  function commitEdit() {
    setEditing(false);
    onEditFinished();

    updateLine(editedLine);
  }

  function updateEditedLine(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = event.currentTarget.value.trim();
    setEditedLine(value);
  }

  function handleLineDragStart(event: DragEvent<HTMLDivElement>) {
    const dragPreview = dragPreviewRef.current;

    if (dragPreview) {
      const rect = dragPreview.getBoundingClientRect();

      event.dataTransfer.setDragImage(
        dragPreview,
        event.clientX - rect.left,
        event.clientY - rect.top
      );
    }

    onDragStart(event);
  }

  useEffect(() => {
    if (virgin) {
      startEdit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    autoHeight(inputRef);
  }, [editing, editedLine]);

  const imageUrl = extractImageUrl(editedLine);
  const isImage = !!imageUrl;
  const canInlineEdit = expanded && !readonly && !isImage;
  const textClassName = expanded
    ? `block whitespace-pre-wrap [&>pre]:whitespace-pre-wrap ${virgin && "opacity-30"}`
    : `block overflow-hidden text-ellipsis whitespace-nowrap ${virgin && "opacity-30"}`;

  return (
    <>
      {/* edit */}
      {editing && (
        <div className="border border-black border-opacity-20 rounded-lg border-dashed bg-white p-1 mt-3 text-sm nowheel">
          <TextInputLabel>
            {t("Text line")}
          </TextInputLabel>
          <textarea
            defaultValue={editedLine}
            onChange={updateEditedLine}
            className="w-full py-1 px-1.5 border border-slate-400 rounded-md"
            ref={inputRef}
            rows={3}
          >
          </textarea>
          {showCharLimit &&
            <div className={`text-xs ${valueTooLong ? 'text-red-500' : 'opacity-50'}`}>
              {editedLine.length} / {charLimit}
            </div>
          }
          <div className="flex gap-2 mt-1">
            <Button
              disabled={!editedLine.length || valueTooLong}
              onClick={commitEdit}
            >
              {t("Save")}
            </Button>
            {(deletable || !virgin) &&
              <Button onClick={cancelEdit}>
                {t("Cancel")}
              </Button>
            }
          </div>
        </div>
      )}
      {/* view */}
      {!editing && (
        <div
          className={cn(
            "relative group text-sm",
            canInlineEdit ? "cursor-text" : "",
            isDragging ? "opacity-60" : "",
            isDropTarget
              ? cn(
                "rounded-lg ring-1 ring-offset-2",
                dropTargetClassName ?? "ring-slate-300 ring-offset-white/50"
              )
              : ""
          )}
          onDragEnter={reorderable ? onDragEnter : undefined}
          onDragOver={reorderable ? onDragOver : undefined}
          onDrop={reorderable ? onDrop : undefined}
        >
          <div ref={dragPreviewRef} className="relative flex items-center">
            {reorderable && (
              <div className="absolute right-full top-0 flex h-full w-5 items-center pr-0.5">
                <div
                  className="shrink-0 cursor-grab items-center rounded-md border border-slate-300 bg-slate-200 py-0.5 text-slate-400 opacity-0 transition hover:text-slate-700 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto active:cursor-grabbing"
                  draggable
                  onDragStart={handleLineDragStart}
                  onDragEnd={onDragEnd}
                  onClick={event => event.stopPropagation()}
                >
                  <DragHandle />
                </div>
              </div>
            )}
            <div className="min-w-0 flex-1">
              {isImage &&
                <ImageDisplay url={imageUrl} />
              }
              {!isImage &&
                <p
                  className="border border-black border-opacity-20 rounded-lg border-dashed bg-white/50 px-2 py-1 break-words"
                  onClick={canInlineEdit ? startEdit : undefined}
                >
                  <TextDisplay
                    className={textClassName}
                    text={line || `${t("Text line")} ${index + 1}`}
                  />
                </p>
              }
            </div>
          </div>
          {!readonly && (
            <div className="absolute right-1 top-1 hidden group-hover:block">
              <div className="flex gap-1">
                <Button
                  size="small"
                  onClick={startEdit}
                >
                  <Edit />
                </Button>

                {deletable && (
                  <Button
                    size="small"
                    onClick={deleteLine}
                  >
                    <Delete />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
