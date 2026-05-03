import { Reorder, useDragControls } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Link } from "../../entities/story-node";
import NodeRef from "./node-ref";
import Button from "../core/button";
import { autoHeight, focus } from "../../lib/ref-operations";
import { weights } from "../../lib/constants";
import HandleOut from "./handle-out";
import WeightDices from "./weight-dices";
import { Delete, DragHandle, Edit } from "../core/icons";
import Tooltip from "../core/tooltip";
import { TextInputLabel } from "../core/text-input-label";
import { useTranslation } from "react-i18next";
import { effectInvocationsSchema } from "@/schemas/story-data-schema";
import { formatJson, getJsonEditorErrorMessage, parseJsonWithSchema } from "@/lib/json-editor";
import EffectLines from "./effect-lines";
import ConditionLine from "./condition-line";
import { cn } from "@/lib/utils";
import type { ReorderListItem } from "@/lib/reorder-items";

type Props = {
  value: ReorderListItem<Link>;
  link: Link;
  index: number;
  totalWeight: number;
  deletable: boolean;
  readonly?: boolean;
  interactionsDisabled?: boolean;
  reorderable?: boolean;
  updateLink: (updatedLink: Link) => void;
  deleteLink: () => void;
  onReorderStart: () => void;
  onReorderEnd: () => void;
  onEditStarted: () => void;
  onEditFinished: () => void;
}

export default function NodeLink({
  value,
  link,
  index,
  totalWeight,
  deletable,
  readonly,
  interactionsDisabled = false,
  reorderable = false,
  updateLink,
  deleteLink,
  onReorderStart,
  onReorderEnd,
  onEditStarted,
  onEditFinished
}: Props) {
  const { t } = useTranslation();

  const initialWeight = link.weight || weights.default;
  const noWeight = !link.weight;

  const [weight, setWeight] = useState(initialWeight);
  const [condition, setCondition] = useState(link.condition ?? "");
  const [effectsValue, setEffectsValue] = useState(formatJson(link.effects ?? []));
  const [editing, setEditing] = useState(noWeight);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragControls = useDragControls();

  const inputRef = useRef<HTMLInputElement>(null);
  const effectsRef = useRef<HTMLTextAreaElement>(null);

  const weightPercent = Math.round(link.weight / totalWeight * 100);

  function startEdit() {
    if (readonly) {
      return;
    }

    setWeight(initialWeight);
    setCondition(link.condition ?? "");
    setEffectsValue(formatJson(link.effects ?? []));
    setError(null);

    setEditing(true);
    onEditStarted();

    focus(inputRef);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
    onEditFinished();

    if (link.weight > 0) {
      setWeight(link.weight);
    } else {
      deleteLink();
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

      updateLink?.({
        ...link,
        weight,
        condition: condition.trim() || undefined,
        effects: nextEffects
      });
    } catch (error) {
      setError(getJsonEditorErrorMessage(error));
    }
  }

  function updateWeight(event: React.ChangeEvent<HTMLInputElement>) {
    setWeight(
      Number(event.currentTarget.value)
    );
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
    if (noWeight) {
      startEdit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => autoHeight(inputRef), [weight]);
  useEffect(() => autoHeight(effectsRef, 220), [editing, effectsValue]);

  const isInvalidWeight = (weight: number) => weight <= weights.min || weight > weights.max;
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
        "relative -mr-2 bg-gradient-to-r from-transparent to-yellow-300 py-1 text-sm",
        hoverEnabled ? "group" : "",
        dragging ? "z-10" : ""
      )}
    >
      <div>
        {/* edit */}
        {editing &&
          <div className="my-1 mr-2 rounded-lg border border-black border-opacity-20 border-dashed bg-white p-1">
            <TextInputLabel>
              {t("Link weight")}
            </TextInputLabel>
            <input
              type="number"
              defaultValue={weight}
              onChange={updateWeight}
              className="w-full rounded-md border border-slate-400 px-1.5 py-1"
              ref={inputRef}
              min={weights.min}
              max={weights.max}
            />
            {!!weight && (
              <div className="mt-1">
                <WeightDices weight={weight} />
              </div>
            )}
            <div className="mt-1">
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
            </div>
            {error && (
              <div className="mt-1 text-xs text-red-500">
                {error}
              </div>
            )}
            <div className="mt-2 flex gap-2">
              <Button
                onClick={commitEdit}
                disabled={isInvalidWeight(weight)}
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
          <div className={cn("relative flex items-center gap-2 break-words pr-2", dragging ? "opacity-70" : "")}>
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
                <Tooltip
                  tooltip={
                    <div className="flex flex-col">
                      <span>{t("Link weight")}: {link.weight}</span>
                      <span>{t("Probability")}: {weightPercent}%</span>
                    </div>
                  }
                  side="top"
                >
                  <WeightDices weight={link.weight} />
                </Tooltip>
              </div>
              <ConditionLine condition={link.condition} className="opacity-70" />
              <EffectLines effects={link.effects} className="opacity-70" />
            </div>
            <div className="shrink-0">
              <NodeRef id={link.id} />
            </div>
          </div>
        }
        {!noWeight &&
          <HandleOut
            id={String(index)}
            connected={!!link.id}
          />
        }
      </div>
      {!editing && !readonly && hoverEnabled &&
        <div className="absolute right-3 top-1 hidden group-hover:block">
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
                onClick={deleteLink}
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
