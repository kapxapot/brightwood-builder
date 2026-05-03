import { Reorder, useDragControls } from "framer-motion";
import { useEffect, useRef, useState } from "react";
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
  value: {
    id: string;
    line: string;
  };
  line: string;
  index: number;
  deletable: boolean;
  expanded?: boolean;
  readonly?: boolean;
  interactionsDisabled?: boolean;
  charLimit?: number;
  reorderable?: boolean;
  updateLine: (updatedLine: string) => void;
  deleteLine: () => void;
  onReorderStart: () => void;
  onReorderEnd: () => void;
  onEditStarted: () => void;
  onEditFinished: () => void;
};

export default function NodeTextLine({
  value,
  line,
  index,
  deletable,
  expanded = false,
  readonly,
  interactionsDisabled = false,
  charLimit = 0,
  reorderable = false,
  updateLine,
  deleteLine,
  onReorderStart,
  onReorderEnd,
  onEditStarted,
  onEditFinished
}: Props) {
  const { t } = useTranslation();

  const virgin = !line.length;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [editedLine, setEditedLine] = useState(line);
  const [editing, setEditing] = useState(virgin);
  const [dragging, setDragging] = useState(false);
  const dragControls = useDragControls();
  const { showCharLimit, valueTooLong } = useCharLimit(editedLine, charLimit);

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

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    event.stopPropagation();
    dragControls.start(event);
  }

  function handleDragStart() {
    setDragging(true);
    onReorderStart();
  }

  function handleDragEnd() {
    setDragging(false);
    onReorderEnd();
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
  const hoverEnabled = !interactionsDisabled && !dragging;
  const canInlineEdit = expanded && !readonly && !interactionsDisabled && !isImage;
  const layoutTransition = dragging || interactionsDisabled
    ? {
        type: "spring",
        stiffness: 500,
        damping: 40
      }
    : {
        duration: 0
      };
  const textClassName = expanded
    ? `block whitespace-pre-wrap [&>pre]:whitespace-pre-wrap ${virgin && "opacity-30"}`
    : `block overflow-hidden text-ellipsis whitespace-nowrap ${virgin && "opacity-30"}`;

  return (
    <Reorder.Item
      as="div"
      value={value}
      drag={reorderable && !editing ? "y" : false}
      dragControls={dragControls}
      dragListener={false}
      layout="position"
      transition={{ layout: layoutTransition }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{
        scale: 1.01,
        zIndex: 20
      }}
      className={cn(
        "relative text-sm",
        hoverEnabled ? "group" : "",
        canInlineEdit ? "cursor-text" : "",
        dragging ? "z-10" : ""
      )}
    >
      {/* edit */}
      {editing && (
        <div className="border border-black border-opacity-20 rounded-lg border-dashed bg-white p-1 text-sm nowheel">
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
        <div className={cn("relative flex items-center", dragging ? "opacity-70" : "")}>
          {reorderable && (
            <div className="absolute right-full top-0 flex h-full w-5 items-center pr-0.5">
              <button
                type="button"
                aria-label={t("Drag")}
                className={cn(
                  "nodrag nopan shrink-0 cursor-grab items-center rounded-md border border-slate-300 bg-slate-200 py-0.5 text-slate-400 transition active:cursor-grabbing",
                  hoverEnabled ? "opacity-0 hover:text-slate-700 group-hover:opacity-100" : "opacity-0",
                  dragging ? "opacity-100 text-slate-700" : ""
                )}
                onClick={event => event.stopPropagation()}
                onPointerDown={handlePointerDown}
              >
                <DragHandle />
              </button>
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
          {!readonly && hoverEnabled && (
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
    </Reorder.Item>
  );
}
