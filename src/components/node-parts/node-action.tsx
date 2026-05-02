import { type Action } from "../../entities/story-node";
import NodeRef from "./node-ref";
import Button from "../core/button";
import { useEffect, useRef, useState } from "react";
import { autoHeight, focus } from "../../lib/ref-operations";
import HandleOut from "./handle-out";
import { Bolt, Delete, Edit, MoveDown, MoveUp } from "../core/icons";
import { TextInputLabel } from "../core/text-input-label";
import { useCharLimit } from "@/hooks/use-char-limit";
import { useTranslation } from "react-i18next";
import { effectInvocationsSchema } from "@/schemas/story-data-schema";
import { formatJson, getJsonEditorErrorMessage, parseJsonWithSchema } from "@/lib/json-editor";
import EffectLines from "./effect-lines";
import ConditionLine from "./condition-line";

type Props = {
  action: Action;
  index: number;
  deletable: boolean;
  nodeEditing?: boolean;
  charLimit?: number;
  isFirst: boolean;
  isLast: boolean;
  updateAction: (updatedAction: Action) => void;
  deleteAction: () => void;
  moveActionDown: () => void;
  moveActionUp: () => void;
  onEditStarted: () => void;
  onEditFinished: () => void;
}

export default function NodeAction({ action, index, deletable, nodeEditing, charLimit = 0, isFirst, isLast, updateAction, deleteAction, moveActionDown, moveActionUp, onEditStarted, onEditFinished }: Props) {
  const { t } = useTranslation();

  const initialLabel = action.label;
  const noLabel = !initialLabel.length;

  const [label, setLabel] = useState(initialLabel);
  const [condition, setCondition] = useState(action.condition ?? "");
  const [effectsValue, setEffectsValue] = useState(formatJson(action.effects ?? []));
  const [editing, setEditing] = useState(noLabel);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const effectsRef = useRef<HTMLTextAreaElement>(null);

  const { showCharLimit, valueTooLong} = useCharLimit(label, charLimit);

  function startEdit() {
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

  useEffect(() => {
    if (noLabel) {
      startEdit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => autoHeight(inputRef), [label]);
  useEffect(() => autoHeight(effectsRef, 220), [editing, effectsValue]);

  return (
    <div
      className="relative group text-sm bg-gradient-to-r from-transparent to-green-300 py-1 -mr-2"
    >
      <div>
        {/* edit */}
        {editing &&
          <div className="border border-black border-opacity-20 rounded-lg border-dashed bg-white p-1 mr-2 my-1">
            <TextInputLabel>
              {t("Action label")}
            </TextInputLabel>
            <input
              type="text"
              defaultValue={label}
              onChange={updateLabel}
              className="w-full py-1 px-1.5 mb-1 border border-slate-400 rounded-md"
              ref={inputRef}
            />
            <TextInputLabel>
              {t("Condition")}
            </TextInputLabel>
            <input
              type="text"
              defaultValue={condition}
              onChange={updateCondition}
              className="w-full py-1 px-1.5 mb-1 border border-slate-400 rounded-md"
            />
            <TextInputLabel>
              {t("Effects JSON")}
            </TextInputLabel>
            <textarea
              defaultValue={effectsValue}
              onChange={updateEffectsValue}
              className="w-full py-1 px-1.5 border border-slate-400 rounded-md font-mono"
              ref={effectsRef}
              rows={4}
            >
            </textarea>
            {showCharLimit &&
              <div className={`text-xs ${valueTooLong ? 'text-red-500' : 'opacity-50'}`}>
                {label.length} / {charLimit}
              </div>
            }
            {error && (
              <div className="mt-1 text-xs text-red-500">
                {error}
              </div>
            )}
            <div className="flex gap-2 mt-1">
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
          <div className="break-words pr-2">
            <div className="flex gap-1">
              <Bolt />
              <div>
                {initialLabel} <NodeRef id={action.id} />
              </div>
            </div>
            {action.condition && (
              <ConditionLine condition={action.condition} className="mt-1 text-sm opacity-70" />
            )}
            {action.effects?.length ? (
              <EffectLines effects={action.effects} className="mt-1 text-sm opacity-70" />
            ) : null}
          </div>
        }
        {!noLabel &&
          <HandleOut
            id={String(index)}
            connected={!!action.id}
          />
        }
      </div>
      {/* view */}
      {!editing && !nodeEditing &&
        <div className="absolute right-3 top-1 hidden group-hover:block">
          <div className="flex gap-1">
            {!isFirst && (
              <Button
                size="small"
                onClick={moveActionUp}
              >
                <MoveUp />
              </Button>
            )}

            {!isLast && (
              <Button
                size="small"
                onClick={moveActionDown}
              >
                <MoveDown />
              </Button>
            )}

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
    </div>
  );
}
