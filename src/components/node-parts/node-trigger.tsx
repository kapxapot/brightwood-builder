import type { RedirectTrigger } from "@/entities/story-data";
import type { ReorderListItem } from "@/lib/reorder-items";
import { autoHeight, focus } from "@/lib/ref-operations";
import { cn } from "@/lib/utils";
import { Reorder, useDragControls } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../core/button";
import { Condition, Delete, DragHandle, Edit } from "../core/icons";
import { TextInputLabel } from "../core/text-input-label";
import ConditionLine from "./condition-line";
import HandleOut from "./handle-out";
import NodeRef from "./node-ref";

type Props = {
  value: ReorderListItem<RedirectTrigger>;
  trigger: RedirectTrigger;
  index: number;
  deletable: boolean;
  readonly?: boolean;
  interactionsDisabled?: boolean;
  reorderable?: boolean;
  updateTrigger: (updatedTrigger: RedirectTrigger) => void;
  deleteTrigger: () => void;
  onReorderStart: () => void;
  onReorderEnd: () => void;
  onEditStarted: () => void;
  onEditFinished: () => void;
};

export default function NodeTrigger({
  value,
  trigger,
  index,
  deletable,
  readonly,
  interactionsDisabled = false,
  reorderable = false,
  updateTrigger,
  deleteTrigger,
  onReorderStart,
  onReorderEnd,
  onEditStarted,
  onEditFinished
}: Props) {
  const { t } = useTranslation();
  const [condition, setCondition] = useState(trigger.condition ?? "");
  const [editing, setEditing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragControls = useDragControls();
  const inputRef = useRef<HTMLInputElement>(null);
  const draftTriggerRef = useRef(
    (trigger.condition ?? "").trim().length === 0 && trigger.targetId === undefined
  );

  function startEdit() {
    if (readonly) {
      return;
    }

    setCondition(trigger.condition ?? "");
    setEditing(true);
    onEditStarted();

    focus(inputRef);
  }

  function cancelEdit() {
    setEditing(false);
    onEditFinished();

    if (draftTriggerRef.current) {
      deleteTrigger();
      return;
    }

    setCondition(trigger.condition ?? "");
  }

  function commitEdit() {
    const trimmedCondition = condition.trim();

    if (!trimmedCondition.length) {
      return;
    }

    draftTriggerRef.current = false;
    setEditing(false);
    onEditFinished();

    updateTrigger({
      ...trigger,
      condition: trimmedCondition
    });
  }

  function updateCondition(event: React.ChangeEvent<HTMLInputElement>) {
    setCondition(event.currentTarget.value);
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
    if (draftTriggerRef.current) {
      startEdit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => autoHeight(inputRef), [condition]);

  const hoverEnabled = !interactionsDisabled && !dragging;
  const layoutTransition = dragging || interactionsDisabled
    ? {
        type: "spring",
        stiffness: 500,
        damping: 40
      }
    : {
        duration: 0
      };
  const displayCondition = trigger.condition?.trim() ?? "";
  const missingCondition = displayCondition.length === 0;
  const editedConditionIsEmpty = condition.trim().length === 0;

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
        "relative -mr-2 bg-gradient-to-r from-transparent to-violet-300 py-1 text-sm",
        hoverEnabled ? "group" : "",
        dragging ? "z-10" : ""
      )}
    >
      <div>
        {editing && (
          <div className="my-1 mr-2 rounded-lg border border-black border-opacity-20 border-dashed bg-white p-1">
            <TextInputLabel>
              {t("Trigger condition")}
            </TextInputLabel>
            <input
              type="text"
              defaultValue={condition}
              onChange={updateCondition}
              className="w-full rounded-md border border-slate-400 px-1.5 py-1"
              ref={inputRef}
            />
            <div className="mt-2 flex gap-2">
              <Button onClick={commitEdit} disabled={editedConditionIsEmpty}>
                {t("Save")}
              </Button>
              <Button onClick={cancelEdit}>
                {t("Cancel")}
              </Button>
            </div>
          </div>
        )}

        {!editing && (
          <div className={cn("relative flex items-center gap-2 pr-2", dragging ? "opacity-70" : "")}>
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

            <div className="min-w-0 flex-1 space-y-1">
              {!missingCondition ? (
                <ConditionLine condition={trigger.condition} className="opacity-70" />
              ) : (
                <div className="flex min-w-0 items-center gap-1.5 text-red-500">
                  <Condition />
                  <span className="truncate">{t("Condition")}: {t("Not set")}</span>
                </div>
              )}
            </div>

            <div className="shrink-0">
              <NodeRef id={trigger.targetId} />
            </div>
          </div>
        )}

        <HandleOut
          id={String(index + 1)}
          connected={trigger.targetId !== undefined}
        />
      </div>

      {!editing && !readonly && hoverEnabled && (
        <div className="absolute right-2 top-1 hidden group-hover:block">
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
                onClick={deleteTrigger}
              >
                <Delete />
              </Button>
            )}
          </div>
        </div>
      )}
    </Reorder.Item>
  );
}
