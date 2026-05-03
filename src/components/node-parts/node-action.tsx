import { Reorder, useDragControls } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Action } from "../../entities/story-node";
import NodeRef from "./node-ref";
import Button from "../core/button";
import { autoHeight, focus } from "../../lib/ref-operations";
import HandleOut from "./handle-out";
import { Bolt, Delete, DragHandle, Edit } from "../core/icons";
import { TextInputLabel } from "../core/text-input-label";
import { useCharLimit } from "@/hooks/use-char-limit";
import { useTranslation } from "react-i18next";
import { effectInvocationsSchema } from "@/schemas/story-data-schema";
import { formatJson, getJsonEditorErrorMessage, parseJsonWithSchema } from "@/lib/json-editor";
import EffectLines from "./effect-lines";
import ConditionLine from "./condition-line";
import { cn } from "@/lib/utils";
import type { ReorderListItem } from "@/lib/reorder-items";

type Props = {
  value: ReorderListItem<Action>;
  action: Action;
  index: number;
  expanded?: boolean;
  deletable: boolean;
  readonly?: boolean;
  interactionsDisabled?: boolean;
  charLimit?: number;
  reorderable?: boolean;
  updateAction: (updatedAction: Action) => void;
  deleteAction: () => void;
  onReorderStart: () => void;
  onReorderEnd: () => void;
  onEditStarted: () => void;
  onEditFinished: () => void;
}

export default function NodeAction({
  value,
  action,
  index,
  expanded = true,
  deletable,
  readonly,
  interactionsDisabled = false,
  charLimit = 0,
  reorderable = false,
  updateAction,
  deleteAction,
  onReorderStart,
  onReorderEnd,
  onEditStarted,
  onEditFinished
}: Props) {
  const { t } = useTranslation();

  const initialLabel = action.label;
  const noLabel = !initialLabel.length;

  const [label, setLabel] = useState(initialLabel);
  const [condition, setCondition] = useState(action.condition ?? "");
  const [effectsValue, setEffectsValue] = useState(formatJson(action.effects ?? []));
  const [editing, setEditing] = useState(noLabel);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragControls = useDragControls();

  const inputRef = useRef<HTMLInputElement>(null);
  const effectsRef = useRef<HTMLTextAreaElement>(null);

  const { showCharLimit, valueTooLong } = useCharLimit(label, charLimit);

  function startEdit() {
    if (readonly) {
      return;
    }

    setLabel(initialLabel);
    setCondition(action.condition ?? "");
    setEffectsValue(formatJson(action.effects ?? []));
    setError(null);

    setEditing(true);
    onEditStarted();

    focus(inputRef);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
    onEditFinished();

    if (initialLabel.length) {
      setLabel(action.label);
    } else {
      deleteAction();
    }
  }

  function commitEdit() {
    try {
      const trimmedEffects = effectsValue.trim();
      const nextEffects = trimmedEffects.length
        ? parseJsonWithSchema(trimmedEffects, effectInvocationsSchema)
        : undefined;

      setEditing(false);
      setError(null);
      onEditFinished();

      updateAction?.({
        ...action,
        label,
        condition: condition.trim() || undefined,
        effects: nextEffects
      });
    } catch (error) {
      setError(getJsonEditorErrorMessage(error));
    }
  }

  function updateLabel(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.currentTarget.value;
    setLabel(value.trim());
  }

  function updateCondition(event: React.ChangeEvent<HTMLInputElement>) {
    setCondition(event.currentTarget.value);
  }

  function updateEffectsValue(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setEffectsValue(event.currentTarget.value);
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
    if (noLabel) {
      startEdit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => autoHeight(inputRef), [label]);
  useEffect(() => autoHeight(effectsRef, 220), [editing, effectsValue]);

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
        "relative -mr-2 bg-gradient-to-r from-transparent to-green-300 py-1 text-sm",
        hoverEnabled ? "group" : "",
        dragging ? "z-10" : ""
      )}
    >
      <div>
        {/* edit */}
        {editing &&
          <div className="my-1 mr-2 rounded-lg border border-black border-opacity-20 border-dashed bg-white p-1">
            <TextInputLabel>
              {t("Action label")}
            </TextInputLabel>
            <input
              type="text"
              defaultValue={label}
              onChange={updateLabel}
              className="mb-1 w-full rounded-md border border-slate-400 px-1.5 py-1"
              ref={inputRef}
            />
            <TextInputLabel>
              {t("Condition")}
            </TextInputLabel>
            <input
              type="text"
              defaultValue={condition}
              onChange={updateCondition}
              className="mb-1 w-full rounded-md border border-slate-400 px-1.5 py-1"
            />
            <TextInputLabel>
              {t("Effects JSON")}
            </TextInputLabel>
            <textarea
              defaultValue={effectsValue}
              onChange={updateEffectsValue}
              className="w-full rounded-md border border-slate-400 px-1.5 py-1 font-mono"
              ref={effectsRef}
              rows={4}
            >
            </textarea>
            {showCharLimit &&
              <div className={`text-xs ${valueTooLong ? "text-red-500" : "opacity-50"}`}>
                {label.length} / {charLimit}
              </div>
            }
            {error && (
              <div className="mt-1 text-xs text-red-500">
                {error}
              </div>
            )}
            <div className="mt-1 flex gap-2">
              <Button
                disabled={!label.length || valueTooLong}
                onClick={commitEdit}
              >
                {t("Save")}
              </Button>
              <Button onClick={cancelEdit}>
                {t("Cancel")}
              </Button>
            </div>
          </div>
        }
        {/* view */}
        {!editing &&
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
              <div className="flex min-w-0 items-start gap-1">
                <Bolt />
                <div className="min-w-0 truncate">
                  {initialLabel}
                </div>
              </div>

              <ConditionLine condition={action.condition} className="opacity-70" />

              <EffectLines
                effects={action.effects}
                expanded={expanded}
                className="opacity-70"
              />
            </div>

            <div className="shrink-0">
              <NodeRef id={action.id} />
            </div>
          </div>
        }
        {!noLabel &&
          <HandleOut
            id={String(index)}
            connected={!!action.id}
          />
        }
      </div>
      {!editing && !readonly && hoverEnabled &&
        <div className="absolute right-2 top-1 hidden group-hover:block">
          <div className="flex gap-1">
            <Button
              size="small"
              onClick={startEdit}
            >
              <Edit />
            </Button>

            {deletable &&
              <Button
                size="small"
                onClick={deleteAction}
              >
                <Delete />
              </Button>
            }
          </div>
        </div>
      }
    </Reorder.Item>
  );
}
